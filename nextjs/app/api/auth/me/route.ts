import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";
import { readJson } from "@/services/wordpressAuth";

const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

// Id del usuario que va dentro del propio JWT. No valida la firma
// (eso lo hace WordPress); solo sirve para comprobar que la respuesta
// de /me corresponde a este token.
function getTokenUserId(token: string): number | null {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64url").toString()
        );

        const id = Number(payload?.data?.user?.id);

        return Number.isFinite(id) ? id : null;
    } catch {
        return null;
    }
}

export async function GET() {
    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    if (!token) {
        return Response.json(
            { message: "Not authenticated" },
            { status: 401 }
        );
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/reactafy/v1/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    const data = await readJson(response);

    if (!response.ok) {
        return Response.json(data, { status: response.status });
    }

    /*
     * Segunda defensa: si WordPress devuelve un usuario distinto al del
     * token (por ejemplo, una respuesta cacheada por error en LiteSpeed),
     * no se muestra nada y se cierra la sesión. Nunca se enseñan los
     * datos de otra persona.
     */
    const tokenUserId = getTokenUserId(token);

    if (tokenUserId === null || Number(data.id) !== tokenUserId) {
        console.error(
            "auth/me: el usuario de la respuesta no coincide con el del token",
            { tokenUserId, responseUserId: data.id }
        );

        cookieStore.delete("authToken");
        cookieStore.delete("cartToken");

        return Response.json(
            { message: "Sesión no válida. Inicia sesión de nuevo." },
            { status: 401, headers: { "Cache-Control": "private, no-store" } }
        );
    }

    return Response.json(data, {
        headers: { "Cache-Control": "private, no-store" },
    });
}
