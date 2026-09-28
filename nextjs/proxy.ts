import { NextResponse, type NextRequest } from "next/server";

// Proxy (antes "middleware"): se ejecuta ANTES de pintar cada página
// de la zona de usuario. Hace dos cosas baratas, sin hablar con
// WordPress:
//
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
    matcher: ["/zona-de-usuario", "/zona-de-usuario/:path*"],
};
