import {
    cleanMessage,
    readJson,
    serverSecretMissingResponse,
    ServerSecretMissingError,
    wordpressServerFetch,
} from "@/services/wordpressAuth";

// Mismo mensaje exista o no la cuenta: no se revela qué emails
// están registrados.
const GENERIC_MESSAGE =
    "Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña.";

export async function POST(request: Request) {
    const body = await readJson(request);

    const email =
        typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
        return Response.json(
            { message: "Introduce tu email." },
            { status: 400 }
        );
    }

    let result;

    try {
        result = await wordpressServerFetch("password/forgot", { email });
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

    // Solo se muestra el error si es de validación (email mal escrito).
    // Cualquier otro fallo se registra y se responde con el genérico.
    if (response.status === 400) {
        return Response.json(
            {
                code: data.code,
                message: cleanMessage(data.message, "El email no es válido."),
            },
            { status: 400 }
        );
    }

    if (!response.ok) {
        console.error("password/forgot", response.status, data);
    }

    return Response.json({ message: GENERIC_MESSAGE });
}
