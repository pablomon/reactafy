import { NextResponse, type NextRequest } from "next/server";

import { siteConfig } from "@/config/site";
import { DEMO_COOKIE, demoToken } from "@/services/demoAccess";

// Proxy (antes "middleware"): se ejecuta ANTES de cada página o ruta
// de API (no de los ficheros estáticos, ver `matcher`).

// ---------- Modo demo ----------
// Con NEXT_PUBLIC_DEMO_MODE=demo solo se puede ver esto. Todo lo
// demás redirige a /tienda/.
const DEMO_ALLOWED = [
    "/acceso",
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
// Con DEMO_PASSWORD definida, toda la web pide contraseña: sin la
// cookie de acceso se va a /acceso/, una página con un único campo.
// Sin el prefijo NEXT_PUBLIC_: se lee en el servidor y nunca llega al
// navegador.
const ACCESS_PAGE = "/acceso";

async function hasAccess(request: NextRequest, password: string): Promise<boolean> {
    const cookie = request.cookies.get(DEMO_COOKIE)?.value;

    return cookie !== undefined && cookie === (await demoToken(password));
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

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const password = process.env.DEMO_PASSWORD;
    const onAccessPage = pathname === ACCESS_PAGE || pathname.startsWith(`${ACCESS_PAGE}/`);

    if (password && !onAccessPage && !(await hasAccess(request, password))) {
        if (pathname.startsWith("/api/")) {
            return Response.json({ message: "Contraseña necesaria." }, { status: 401 });
        }

        const url = new URL(`${ACCESS_PAGE}/`, request.url);
        url.searchParams.set("next", pathname + search);

        return NextResponse.redirect(url);
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
