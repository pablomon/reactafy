// Contraseña de acceso a la web (DEMO_PASSWORD). La usan proxy.ts
// (¿tiene acceso?) y la acción de /acceso/ (dar acceso).
//
// La cookie no guarda la contraseña, sino una huella (SHA-256) de ella:
// si alguien ve la cookie no sabe la contraseña, y si cambias
// DEMO_PASSWORD, las cookies antiguas dejan de valer solas.
export const DEMO_COOKIE = "demoAccess";

export async function demoToken(password: string): Promise<string> {
    const data = new TextEncoder().encode(`aguafy-demo:${password}`);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
