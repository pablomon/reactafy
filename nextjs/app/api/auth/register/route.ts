import { siteConfig } from "@/config/site";
import {
    cleanMessage,
    readJson,
    startSession,
} from "@/services/wordpressAuth";

const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

export async function POST(request: Request) {
    const body = await readJson(request);

    const email =
        typeof body.email === "string" ? body.email.trim() : "";

    const password =
        typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
        return Response.json(
            { message: "Introduce email y contraseña." },
            { status: 400 }
        );
    }

    // Secreto compartido con WordPress (REACTAFY_SERVER_SECRET en
    // wp-config.php). Solo existe en el servidor: sin el prefijo
    // NEXT_PUBLIC_ nunca llega al navegador.
    const secret = process.env.REACTAFY_SERVER_SECRET;

    if (!secret) {
        console.error(
            "Falta REACTAFY_SERVER_SECRET (ver .env.example)"
        );

        return Response.json(
            { message: "El registro no está disponible." },
            { status: 500 }
        );
    }

    const registerResponse = await fetch(
        `${WORDPRESS_URL}/wp-json/reactafy/v1/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Reactafy-Secret": secret,
            },
            body: JSON.stringify({
                email,
                password,
            }),
            cache: "no-store",
        }
    );

    const registerData = await readJson(registerResponse);

    if (!registerResponse.ok) {
        return Response.json(
            {
                code: registerData.code,
                message: cleanMessage(
                    registerData.message,
                    "No se pudo crear la cuenta."
                ),
            },
            { status: registerResponse.status }
        );
    }

    // A diferencia del login, aquí NO se borra cartToken: el usuario
    // es nuevo, no tiene carrito guardado con el que chocar, y así
    // conserva lo que añadió como invitado.
    try {
        const user = await startSession(email, password);

        return Response.json(user);
    } catch {
        // La cuenta ya existe aunque no se haya podido abrir sesión.
        // No es un error para el usuario: si reintentara el registro,
        // recibiría "ya existe una cuenta con este email".
        return Response.json(
            {
                message: "Cuenta creada. Inicia sesión para continuar.",
            },
            { status: 202 }
        );
    }
}
