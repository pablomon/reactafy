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

    let result;

    try {
        result = await wordpressServerFetch("register", {
            email,
            password,
        });
    } catch (error) {
        if (error instanceof ServerSecretMissingError) {
            return serverSecretMissingResponse(
                error,
                "El registro no está disponible."
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
                    "No se pudo crear la cuenta."
                ),
            },
            { status: response.status }
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
