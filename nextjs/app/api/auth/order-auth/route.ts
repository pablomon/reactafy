import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/services/wordpress";
import { setAuthCookie } from "@/services/authCookie";

// El canje es de un solo uso: ninguna capa debe guardar estas
// respuestas.
const NO_STORE = {
    "Cache-Control": "private, no-store",
};

// El número de pedido viene de la URL, así que es texto de fuera:
// sin escapar, cualquiera podría inyectar HTML en esta página.
function escapeHtml(value: string) {
    return value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[character]!
    );
}

// Página de error del canje. Muestra un código corto y estable que
// el cliente nos puede leer por teléfono y que nosotros podemos
// buscar en los logs; el detalle real se queda en el servidor.
//
// Lo primero que necesita leer alguien que acaba de pagar es que su
// compra está registrada.
function errorPage(
    errorCode: string,
    orderId: string | null,
    status: number
) {
    const reference = orderId
        ? ` (pedido ${escapeHtml(orderId)})`
        : "";

    const html = `<!doctype html>
<html lang="es">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>No hemos podido abrir tu pedido</title>
<main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.5">
  <h1>No hemos podido abrir tu pedido</h1>
  <p><strong>Tu compra está registrada.</strong> Recibirás la confirmación por correo.</p>
  <p>Si necesitas ayuda, indícanos este código:</p>
  <p><code>${errorCode}</code>${reference}</p>
  <p><a href="/tienda">Volver a la tienda</a></p>
</main>`;

    return new Response(html, {
        status,
        headers: {
            ...NO_STORE,
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}

function redirectToOrder(orderId: string) {
    return new Response(null, {
        status: 303,
        headers: {
            ...NO_STORE,
            Location: `/pedido/${orderId}`,
        },
    });
}

export async function GET(request: Request) {

    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");

    // El número de pedido llega de fuera y acaba en una cabecera
    // Location y en la ruta de la API. Aquí no se sanea: si no es
    // un número, la petición no sigue.
    const orderParam = searchParams.get("order");

    const orderId =
        orderParam && /^\d+$/.test(orderParam)
            ? orderParam
            : null;

    const cookieStore = await cookies();

    // Si ya hay sesión, el canje anterior funcionó: esto es una
    // recarga o un botón de atrás, no un error.
    const hasSession = Boolean(
        cookieStore.get("authToken")?.value
    );

    if (orderParam && !orderId) {
        console.error(
            "order-auth: el parámetro order no es un número",
            orderParam
        );

        return errorPage(
            "ORDER_AUTH_BAD_ORDER",
            null,
            400
        );
    }

    if (!code || !orderId) {
        console.error("order-auth: faltan code u order");

        return errorPage(
            "ORDER_AUTH_MISSING_CODE",
            orderId,
            400
        );
    }

    let response: Response;

    try {
        response = await fetch(
            `${WORDPRESS_URL}/wp-json/reactafy/v1/order-auth`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                }),
                cache: "no-store",
            }
        );
    } catch (error) {
        console.error("order-auth: WordPress no responde", error);

        return errorPage(
            "ORDER_AUTH_UNREACHABLE",
            orderId,
            502
        );
    }

    // Un fatal de PHP o un error del CDN llegan como HTML, no como
    // JSON: sin el catch, esto lanzaría y Next respondería un 500
    // genérico en la pantalla siguiente al pago.
    const data = await response
        .json()
        .catch(() => null);

    if (data === null) {
        console.error(
            `order-auth: respuesta no JSON de WordPress (${response.status})`
        );

        return errorPage(
            "ORDER_AUTH_BAD_RESPONSE",
            orderId,
            502
        );
    }

    if (!response.ok) {
        console.error(
            `order-auth: WordPress rechazó el code (${response.status})`,
            data
        );

        // El código es de un solo uso, así que recargar esta URL
        // siempre falla. Si la sesión ya está puesta, no hay nada
        // que arreglar: al pedido.
        if (hasSession) {
            return redirectToOrder(orderId);
        }

        return errorPage(
            "ORDER_AUTH_REJECTED",
            orderId,
            response.status
        );
    }

    if (!data.token) {
        console.error(
            "order-auth: WordPress no devolvió token",
            data
        );

        return errorPage(
            "ORDER_AUTH_NO_TOKEN",
            orderId,
            500
        );
    }

    await setAuthCookie(data.token);

    cookieStore.delete("cartToken");

    return redirectToOrder(orderId);
}
