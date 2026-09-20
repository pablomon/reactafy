import { cookies } from "next/headers";

// El plugin JWT firma tokens de 7 días salvo que alguien toque el
// filtro jwt_auth_expire. Solo se usa si el token no trae un `exp`
// utilizable, que no debería pasar.
const DEFAULT_MAX_AGE =
    60 * 60 * 24 * 7;

// Segundos que le quedan de vida al token, sacados de su propio
// `exp`. Sin esto la cookie no lleva maxAge, el navegador la trata
// como cookie de sesión y la sesión se pierde al cerrarlo aunque
// el token siguiera siendo válido durante días.
//
// No valida la firma: eso lo hace WordPress. Aquí solo se lee una
// fecha para decidir cuánto guardar la cookie.
function getMaxAge(token: string): number {
    try {
        const payload = JSON.parse(
            Buffer.from(
                token.split(".")[1],
                "base64url"
            ).toString()
        );

        const seconds =
            Number(payload.exp) -
            Math.floor(Date.now() / 1000);

        if (!Number.isFinite(seconds) || seconds <= 0) {
            return DEFAULT_MAX_AGE;
        }

        return Math.floor(seconds);
    } catch {
        return DEFAULT_MAX_AGE;
    }
}

// Único sitio donde se escribe la cookie de sesión: el login y la
// vuelta del checkout deben guardarla con las mismas opciones.
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: getMaxAge(token),
    });
}
