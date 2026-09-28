// Adónde volver tras iniciar sesión (?next=…). Solo rutas de esta web:
// si alguien fabrica un enlace /login/?next=https://otra-web.com, se
// ignora y se va a la zona de usuario ("open redirect").
export const DEFAULT_AFTER_LOGIN = "/zona-de-usuario/";

export function safeNext(value: unknown): string {
    if (typeof value !== "string") {
        return DEFAULT_AFTER_LOGIN;
    }

    // "/algo" sí; "//otra-web.com" y "/\otra-web.com" no (el navegador
    // los trata como otra web)
    if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
        return DEFAULT_AFTER_LOGIN;
    }

    // Volver al login o al registro no tiene sentido
    if (value.startsWith("/login") || value.startsWith("/registro")) {
        return DEFAULT_AFTER_LOGIN;
    }

    return value;
}
