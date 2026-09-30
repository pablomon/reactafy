import { NextResponse, type NextRequest } from "next/server";

import { siteConfig } from "@/config/site";

// Proxy (antes "middleware"): se ejecuta ANTES de cada página o ruta
// de API (no de los ficheros estáticos, ver `matcher`).

// ---------- Modo demo ----------
// Con NEXT_PUBLIC_DEMO_MODE=tienda solo se puede ver esto. Todo lo
// demás redirige a /tienda/.
const DEMO_ALLOWED = [
    "/tienda",
    "/carrito",
    "/zona-de-usuario",
    // Para poder entrar en la cuenta
    "/login",
    "/registro",
    "/recuperar-contrasena",
    "/nueva-contrasena",
    // APIs que usan la tienda, el carrito y la cuenta
    "/api/products",
    "/api/cart",
    "/api/auth",
];

function isDemoAllowed(pathname: string): boolean {
    return DEMO_ALLOWED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// ---------- Contraseña de acceso ----------
// Con DEMO_PASSWORD definida, toda la web pide contraseña (la ventana
// nativa del navegador, "HTTP Basic Auth"). El usuario da igual: solo
// se comprueba la contraseña. El navegador la recuerda hasta que se
// cierra, y la manda sola en cada petición (páginas, APIs, acciones).
// Sin el prefijo NEXT_PUBLIC_: se lee en el servidor al arrancar y
// nunca llega al navegador.
function passwordOk(request: NextRequest, password: string): boolean {
    const header = request.headers.get("authorization") ?? "";

    if (!header.startsWith("Basic ")) {
        return false;
    }

    try {
        // "usuario:contraseña" en base64
        const decoded = atob(header.slice(6));
        const given = decoded.slice(decoded.indexOf(":") + 1);

        // Comparación sin cortar al primer carácter distinto (no da
        // pistas por el tiempo de respuesta)
        let diff = given.length ^ password.length;
        for (let i = 0; i < password.length; i++) {
            diff |= (given.charCodeAt(i) || 0) ^ password.charCodeAt(i);
        }

        return diff === 0;
    } catch {
        return false;
    }
}

function askPassword(): Response {
    return new Response("Contraseña necesaria.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Aguafy", charset="UTF-8"' },
    });
}

// ---------- Zona de usuario ----------
// 1. Sin cookie de sesión → al login directamente, con ?next= para
//    volver aquí después. (Si la cookie existe pero ha caducado, eso
//    lo descubre el layout al preguntar a WordPress.)
// 2. Deja la ruta en la cabecera x-pathname, porque los layouts y las
//    Server Actions no saben en qué URL están. loginUrl() la usa para
//    construir el ?next= cuando el token ha caducado.
function accountArea(request: NextRequest) {
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

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const password = process.env.DEMO_PASSWORD;

    if (password && !passwordOk(request, password)) {
        return askPassword();
    }

    if (siteConfig.DEMO_MODE && !isDemoAllowed(pathname)) {
        // Una API bloqueada (p. ej. /api/checkout) responde error, no una página
        if (pathname.startsWith("/api/")) {
            return Response.json({ message: "Proximamente." }, { status: 403 });
        }

        return NextResponse.redirect(new URL("/tienda/", request.url));
    }

    if (pathname === "/zona-de-usuario" || pathname.startsWith("/zona-de-usuario/")) {
        return accountArea(request);
    }

    return NextResponse.next();
}

export const config = {
    // Todo menos los ficheros de Next (_next/…) y los estáticos
    // (cualquier ruta con extensión: .ico, .svg, .webp…)
    matcher: ["/((?!_next/|.*\\..*).*)"],
};
