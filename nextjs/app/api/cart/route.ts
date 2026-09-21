import { cookies } from "next/headers";

import type { Cart } from "@/types/cart";
import type { Money } from "@/types/money";

import { WORDPRESS_URL } from "@/services/wordpress";

const CART_API_URL =
    `${WORDPRESS_URL}/wp-json/wc/store/v1/cart`;

// La sesión de invitado de WooCommerce caduca a las 48 h
// (filtro wc_session_expiration). Sin maxAge, la cookie moría
// al cerrar el navegador y el invitado perdía el carrito.
const CART_TOKEN_MAX_AGE =
    60 * 60 * 48;

// El carrito es de cada usuario: ninguna caché intermedia
// debe guardar estas respuestas.
const NO_STORE = {
    "Cache-Control": "private, no-store",
};

// Quién hace la petición. Se decide una vez y en un solo
// sitio, así los cuatro métodos no pueden desalinearse.
type Identity =
    | {
        kind: "user";
        authToken: string;
        cartToken?: string;
    }
    | {
        kind: "guest";
        cartToken?: string;
    };

async function getIdentity(): Promise<Identity> {
    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    if (authToken) {
        return {
            kind: "user",
            authToken,
            cartToken,
        };
    }

    return {
        kind: "guest",
        cartToken,
    };
}

function getWooHeaders(
    identity: Identity,
    hasBody: boolean
): HeadersInit {
    const headers: Record<string, string> = {};

    if (hasBody) {
        headers["Content-Type"] =
            "application/json";
    }

    if (identity.kind === "user") {
        headers.Authorization =
            `Bearer ${identity.authToken}`;
    }

    if (identity.cartToken) {
        headers["Cart-Token"] =
            identity.cartToken;
    }

    return headers;
}

async function saveCartToken(
    identity: Identity,
    response: Response
) {

    const newCartToken =
        response.headers.get("Cart-Token");

    if (!newCartToken || newCartToken === identity.cartToken) {
        return;
    }

    const cookieStore = await cookies();

    cookieStore.set("cartToken", newCartToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: CART_TOKEN_MAX_AGE,
    });
}

type WooMoneyFields = {
    currency_code: string;
    currency_minor_unit: number;
};

type WooCart = Omit<Cart, "items" | "totals"> & {
    items: (Omit<Cart["items"][number], "prices" | "totals"> & {
        prices: WooMoneyFields & { price: string };
        totals: WooMoneyFields & {
            line_subtotal: string;
            line_total: string;
        };
    })[];
    totals: WooMoneyFields & {
        total_items: string;
        total_price: string;
        total_tax: string;
    };
};

function toMoney(
    amount: string,
    source: WooMoneyFields
): Money {
    return {
        amount,
        currency: source.currency_code,
        minorUnit: source.currency_minor_unit,
    };
}

// Devuelve exactamente la forma de `Cart`, no la respuesta de
// Woo con campos cambiados: el cliente depende de este tipo,
// no de lo que WooCommerce decida añadir en la próxima versión.
function normalizeCart(data: WooCart): Cart {
    return {
        items_count: data.items_count,

        items: data.items.map((item) => ({
            key: item.key,
            id: item.id,
            quantity: item.quantity,
            name: item.name,
            images: item.images,
            variation: item.variation,
            prices: {
                price: toMoney(item.prices.price, item.prices),
            },
            totals: {
                line_subtotal: toMoney(item.totals.line_subtotal, item.totals),
                line_total: toMoney(item.totals.line_total, item.totals),
            },
        })),

        totals: {
            total_items: toMoney(data.totals.total_items, data.totals),
            total_price: toMoney(data.totals.total_price, data.totals),
            total_tax: toMoney(data.totals.total_tax, data.totals),
        },
    };
}

function errorResponse(message: string, status: number) {
    return Response.json(
        { message },
        { status, headers: NO_STORE }
    );
}

// Todo lo que tienen en común los cuatro métodos: identidad,
// petición, token, errores y normalización.
async function callWoo(
    path: string,
    body?: Record<string, unknown>
): Promise<Response> {
    const identity = await getIdentity();

    let response: Response;

const start = performance.now();

    try {
        response = await fetch(`${CART_API_URL}${path}`, {
            method: body ? "POST" : "GET",
            headers: getWooHeaders(identity, Boolean(body)),
            body: body ? JSON.stringify(body) : undefined,
            cache: "no-store",
        });

    } catch {
        return errorResponse("WooCommerce no responde", 502);
    }


    // Se guarda también si Woo responde con error: en la primera
    // petición de un invitado la sesión se crea igualmente, y sin
    // guardar el token la siguiente petición crearía otra.
    await saveCartToken(identity, response);

    // Un error del CDN o de PHP llega como HTML, no como JSON.
    const data = await response.json().catch(() => null);

    if (data === null) {
        console.error(`Woo ${path}: respuesta no JSON (${response.status})`);

        return errorResponse("Respuesta inválida de WooCommerce", 502);
    }

    if (!response.ok) {
        console.error(`Woo ${path}: ${response.status}`, data);

        return Response.json(data, {
            status: response.status,
            headers: NO_STORE,
        });
    }

    return Response.json(normalizeCart(data), {
        headers: NO_STORE,
    });
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) > 0;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
}

async function readBody(
    request: Request
): Promise<Record<string, unknown> | null> {
    return request.json().catch(() => null);
}

export async function GET() {
    return callWoo("");
}

export async function POST(request: Request) {
    const body = await readBody(request);

    if (!isPositiveInteger(body?.id) || !isPositiveInteger(body?.quantity)) {
        return errorResponse("id y quantity deben ser enteros positivos", 400);
    }

    return callWoo("/add-item", {
        id: body.id,
        quantity: body.quantity,
    });
}

export async function PUT(request: Request) {
    const body = await readBody(request);

    if (!isNonEmptyString(body?.key) || !isPositiveInteger(body?.quantity)) {
        return errorResponse("key y quantity son obligatorios", 400);
    }

    return callWoo("/update-item", {
        key: body.key,
        quantity: body.quantity,
    });
}

export async function DELETE(request: Request) {
    const body = await readBody(request);

    if (!isNonEmptyString(body?.key)) {
        return errorResponse("key es obligatorio", 400);
    }

    return callWoo("/remove-item", {
        key: body.key,
    });
}