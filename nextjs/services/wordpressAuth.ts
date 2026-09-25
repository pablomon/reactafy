import { siteConfig } from "@/config/site";
import { setAuthCookie } from "@/services/authCookie";

const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

// Forma única del usuario de sesión: la devuelven igual el login
// y el registro, para que el cliente no dependa de por dónde entró.
export type SessionUser = {
    id: number;
    email: string;
    name: string;
};

export class WordPressAuthError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

// WordPress y el plugin JWT devuelven mensajes con HTML
// ("<strong>Error:</strong> …"). Se quita antes de enseñarlos.
export function cleanMessage(
    message: unknown,
    fallback: string
): string {
    if (typeof message !== "string") {
        return fallback;
    }

    const text = message
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return text || fallback;
}

// Lee el JSON sin romper si llega otra cosa (por ejemplo, el HTML
// de un error fatal de PHP). Vale para peticiones y respuestas.
export async function readJson(
    body: { json(): Promise<unknown> }
): Promise<Record<string, unknown>> {
    try {
        const data = await body.json();

        return data && typeof data === "object"
            ? (data as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
}

// Único sitio donde se pide el JWT y se abre la sesión. Lo usan el
// login y el registro. No toca cartToken: eso lo decide cada ruta.
export async function startSession(
    username: string,
    password: string
): Promise<SessionUser> {
    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
            cache: "no-store",
        }
    );

    const data = await readJson(response);

    if (!response.ok || typeof data.token !== "string") {
        throw new WordPressAuthError(
            cleanMessage(data.message, "No se pudo iniciar sesión."),
            response.ok ? 502 : response.status,
            typeof data.code === "string" ? data.code : undefined
        );
    }

    await setAuthCookie(data.token);

    const payload = JSON.parse(
        Buffer.from(
            data.token.split(".")[1],
            "base64url"
        ).toString()
    );

    return {
        id: Number(payload.data.user.id),
        email: String(data.user_email ?? ""),
        name: String(data.user_display_name ?? ""),
    };
}

// Error cuando falta el secreto compartido en el entorno de Next.
export class ServerSecretMissingError extends Error {
    constructor() {
        super("Falta WORDPRESS_SECRET (ver .env.example)");
    }
}

// POST a un endpoint de reactafy/v1 que solo el servidor de Next
// puede llamar. Añade el secreto compartido (REACTAFY_SERVER_SECRET
// en wp-config.php) para que ningún endpoint tenga que repetirlo.
export async function wordpressServerFetch(
    path: string,
    body: unknown
): Promise<{ response: Response; data: Record<string, unknown> }> {
    const secret = siteConfig.WORDPRESS_SECRET;

    if (!secret) {
        throw new ServerSecretMissingError();
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/reactafy/v1/${path}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Reactafy-Secret": secret,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        }
    );

    const data = await readJson(response);

    return { response, data };
}

// Respuesta estándar cuando falta el secreto: se registra en el
// servidor y al usuario se le da un mensaje genérico.
export function serverSecretMissingResponse(
    error: ServerSecretMissingError,
    message: string
): Response {
    console.error(error.message);

    return Response.json({ message }, { status: 500 });
}
