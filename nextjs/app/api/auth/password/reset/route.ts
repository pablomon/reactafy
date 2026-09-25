import {
    cleanMessage,
    readJson,
    serverSecretMissingResponse,
    ServerSecretMissingError,
    startSession,
    wordpressServerFetch,
} from "@/services/wordpressAuth";

export async function POST(request: Request) {
    const body = await readJson(request);

    const login =
        typeof body.login === "string" ? body.login : "";

    const key =
        typeof body.key === "string" ? body.key : "";

    const password =
        typeof body.password === "string" ? body.password : "";

    if (!login || !key) {
        return Response.json(
            { message: "El enlace no es válido. Solicita uno nuevo." },
            { status: 400 }
        );
    }

    if (!password) {
        return Response.json(
            { message: "Introduce una contraseña." },
            { status: 400 }
        );
    }

    let result;

    try {
        result = await wordpressServerFetch("password/reset", {
            login,
            key,
            password,
        });
    } catch (error) {
        if (error instanceof ServerSecretMissingError) {
            return serverSecretMissingResponse(
                error,
                "La recuperación de contraseña no está disponible."
            );
        }

        throw error;
    }

    const { response, data } = result;

    if (!response.ok) {
        return Response.json(
            {
                code: data.code,
                message: cleanMessage(
                    data.message,
                    "No se pudo cambiar la contraseña."
                ),
            },
            { status: response.status }
        );
    }

    // La contraseña ya está cambiada. Se abre sesión directamente para
    // que el usuario no tenga que volver a escribirla en el login.
    // WordPress devuelve el login real (el del enlace podría variar
    // en mayúsculas o codificación).
    const userLogin =
        typeof data.login === "string" ? data.login : login;

    try {
        const user = await startSession(userLogin, password);

        return Response.json(user);
    } catch {
        return Response.json(
            {
                message: "Contraseña cambiada. Inicia sesión para continuar.",
            },
            { status: 202 }
        );
    }
}
