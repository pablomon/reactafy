import { NextResponse, type NextRequest } from "next/server";

// Proxy (antes "middleware"): se ejecuta ANTES de las rutas que indica
// `matcher`, al final del fichero.

// ---------- Zona de usuario ----------
// 1. Sin cookie de sesión → al login directamente, con ?next= para
//    volver aquí después. (Si la cookie existe pero ha caducado, eso
//    lo descubre el layout al preguntar a WordPress.)
// 2. Deja la ruta en la cabecera x-pathname, porque los layouts y las
//    Server Actions no saben en qué URL están. loginUrl() la usa para
//    construir el ?next= cuando el token ha caducado.
export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const path = pathname + search;

    if (!request.cookies.has("authToken")) {
        const url = new URL("/login/", request.url);
        url.searchParams.set("next", path);

        return NextResponse.redirect(url);
    }

    const headers = new Headers(request.headers);
    headers.set("x-pathname", path);

    return NextResponse.next({ request: { headers } });
}

export const config = {
    // Solo la zona de usuario. Antes interceptaba toda la web, para la
    // contraseña de acceso de la demo; al no haber nada que comprobar
    // en el resto de rutas, no hace falta que pasen por aquí.
    matcher: ["/zona-de-usuario", "/zona-de-usuario/:path*"],
};
