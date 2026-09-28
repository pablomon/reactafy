"use server";

import { cookies } from "next/headers";

import { safeNext } from "@/utils/safeNext";
import {
    cleanMessage,
    ServerSecretMissingError,
    startSession,
    WordPressAuthError,
    wordpressServerFetch,
} from "@/services/wordpressAuth";

// Server Actions de las páginas de acceso: login, registro, recuperar
// contraseña y elegir una nueva. Sustituyen a las rutas /api/auth/…
// que llamaban los formularios con fetch. Hablan con los mismos
// endpoints de WordPress (JWT, /register, /password/forgot|reset).

// Lo que recibe el formulario (useActionState)
export type AuthFormState = {
    status: "idle" | "error" | "session" | "done";
    // "error": mensaje general. "done": mensaje final (p. ej. "te hemos
    // enviado un enlace").
    message?: string;
    // Error de cada campo: { email: "Ya existe una cuenta con este email." }
    fields?: Record<string, string>;
    // Lo que había escrito el usuario (nunca las contraseñas): React
    // vacía el formulario al terminar la acción y lo rellena con esto
    values?: Record<string, string>;
    // "session": sesión abierta, el navegador va a esta ruta
    next?: string;
    // WordPress ha dicho que el enlace de recuperación no vale
    invalidLink?: boolean;
};

function text(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
}

// Las contraseñas no se recortan: cambiaría lo que se escribió
function secret(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
}

function unavailable(error: unknown, message: string): AuthFormState {
    if (error instanceof ServerSecretMissingError) {
        console.error(error.message);
        return { status: "error", message };
    }

    throw error;
}

// Errores de contraseña que devuelve WordPress (helpers.php)
function isPasswordError(code: unknown): boolean {
    return typeof code === "string" && /password/.test(code);
}


// ---------- Login ----------

// Mismo mensaje si el usuario no existe o la contraseña está mal: no
// se revela qué emails tienen cuenta.
const WRONG_CREDENTIALS = "El email o la contraseña no son correctos.";

export async function login(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const username = text(formData, "username");
    const password = secret(formData, "password");
    const next = safeNext(formData.get("next"));
    const values = { username };

    const fields: Record<string, string> = {};

    if (!username) fields.username = "Escribe tu email.";
    if (!password) fields.password = "Escribe tu contraseña.";

    if (Object.keys(fields).length) {
        return { status: "error", fields, values };
    }

    try {
        await startSession(username, password);
    } catch (error) {
        if (error instanceof WordPressAuthError) {
            const wrong = /incorrect_password|invalid_username|invalid_email|empty_/.test(error.code ?? "");

            return {
                status: "error",
                message: wrong ? WRONG_CREDENTIALS : error.message,
                values,
            };
        }

        throw error;
    }

    // El usuario ya tiene su carrito guardado en Woo: el de invitado se
    // descarta para que no se mezclen
    (await cookies()).delete("cartToken");

    return { status: "session", next };
}


// ---------- Registro ----------

export async function register(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const email = text(formData, "email");
    const password = secret(formData, "password");
    const confirm = secret(formData, "confirm");
    const next = safeNext(formData.get("next"));
    const values = { email };

    const fields: Record<string, string> = {};

    if (!email) fields.email = "Escribe tu email.";
    if (!password) fields.password = "Elige una contraseña.";
    else if (password !== confirm) fields.confirm = "Las contraseñas no coinciden.";

    if (Object.keys(fields).length) {
        return { status: "error", fields, values };
    }

    let result;

    try {
        result = await wordpressServerFetch("register", { email, password });
    } catch (error) {
        return unavailable(error, "El registro no está disponible.");
    }

    const { response, data } = result;

    if (!response.ok) {
        const message = cleanMessage(data.message, "No se pudo crear la cuenta.");

        if (data.code === "invalid_email" || data.code === "email_exists") {
            return { status: "error", fields: { email: message }, values };
        }

        if (isPasswordError(data.code)) {
            return { status: "error", fields: { password: message }, values };
        }

        return { status: "error", message, values };
    }

    // A diferencia del login, NO se borra cartToken: el usuario es
    // nuevo y conserva lo que añadió como invitado
    try {
        await startSession(email, password);
    } catch {
        // La cuenta existe aunque no se haya podido abrir sesión
        return { status: "done", message: "Cuenta creada. Inicia sesión para continuar." };
    }

    return { status: "session", next };
}


// ---------- Recuperar contraseña ----------

// Igual exista o no la cuenta: no se revela qué emails están registrados
const FORGOT_SENT =
    "Si existe una cuenta con ese email, te hemos enviado un enlace para elegir una contraseña nueva.";

export async function forgotPassword(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const email = text(formData, "email");
    const values = { email };

    if (!email) {
        return { status: "error", fields: { email: "Escribe tu email." }, values };
    }

    let result;

    try {
        result = await wordpressServerFetch("password/forgot", { email });
    } catch (error) {
        return unavailable(error, "La recuperación de contraseña no está disponible.");
    }

    const { response, data } = result;

    // Solo se enseña el error de validación (email mal escrito)
    if (response.status === 400) {
        return {
            status: "error",
            fields: { email: cleanMessage(data.message, "El email no es válido.") },
            values,
        };
    }

    if (!response.ok) {
        console.error("password/forgot", response.status, data);
    }

    return { status: "done", message: FORGOT_SENT };
}


// ---------- Nueva contraseña (enlace del email) ----------

// `link` va atado desde la página (resetPassword.bind(null, { key, login })):
// no viaja como campo del formulario.
export async function resetPassword(
    link: { key: string; login: string },
    _previous: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    const password = secret(formData, "password");
    const confirm = secret(formData, "confirm");

    if (!password) {
        return { status: "error", fields: { password: "Elige una contraseña." } };
    }

    if (password !== confirm) {
        return { status: "error", fields: { confirm: "Las contraseñas no coinciden." } };
    }

    let result;

    try {
        result = await wordpressServerFetch("password/reset", { ...link, password });
    } catch (error) {
        return unavailable(error, "La recuperación de contraseña no está disponible.");
    }

    const { response, data } = result;

    if (!response.ok) {
        const message = cleanMessage(data.message, "No se pudo cambiar la contraseña.");

        if (isPasswordError(data.code)) {
            return { status: "error", fields: { password: message } };
        }

        return { status: "error", message, invalidLink: data.code === "invalid_key" };
    }

    // Ya está cambiada: se abre sesión para no tener que escribirla otra
    // vez. WordPress devuelve el login real.
    const userLogin = typeof data.login === "string" ? data.login : link.login;

    try {
        await startSession(userLogin, password);
    } catch {
        return { status: "done", message: "Contraseña cambiada. Inicia sesión para continuar." };
    }

    return { status: "session", next: safeNext(null) };
}
