import { cookies } from "next/headers";

const WORDPRESS_URL =
    "https://staging.aguafy.com";

const CART_API_URL =
    `${WORDPRESS_URL}/wp-json/wc/store/v1/cart`;


async function getWooHeaders(
    contentType = false
): Promise<HeadersInit> {

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: HeadersInit = {};

    if (contentType) {
        headers["Content-Type"] =
            "application/json";
    }

    if (authToken) {
        headers.Authorization =
            `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] =
            cartToken;
    }

    return headers;
}


async function saveCartToken(
    response: Response
) {

    const newCartToken =
        response.headers.get("Cart-Token");

    if (!newCartToken) {
        return;
    }

    const cookieStore =
        await cookies();

    cookieStore.set(
        "cartToken",
        newCartToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        }
    );
}


function normalizeCart(data: any) {

    return {
        ...data,

        items: data.items.map(
            (item: any) => ({
                ...item,

                prices: {
                    price: {
                        amount:
                            item.prices.price,
                        currency:
                            item.prices.currency_code,
                        minorUnit:
                            item.prices.currency_minor_unit,
                    },
                },

                totals: {
                    line_subtotal: {
                        amount:
                            item.totals.line_subtotal,
                        currency:
                            item.totals.currency_code,
                        minorUnit:
                            item.totals.currency_minor_unit,
                    },

                    line_total: {
                        amount:
                            item.totals.line_total,
                        currency:
                            item.totals.currency_code,
                        minorUnit:
                            item.totals.currency_minor_unit,
                    },
                },
            })
        ),

        totals: {
            total_items: {
                amount:
                    data.totals.total_items,
                currency:
                    data.totals.currency_code,
                minorUnit:
                    data.totals.currency_minor_unit,
            },

            total_price: {
                amount:
                    data.totals.total_price,
                currency:
                    data.totals.currency_code,
                minorUnit:
                    data.totals.currency_minor_unit,
            },

            total_tax: {
                amount:
                    data.totals.total_tax,
                currency:
                    data.totals.currency_code,
                minorUnit:
                    data.totals.currency_minor_unit,
            },
        },
    };
}


export async function GET() {

    const headers =
        await getWooHeaders();

    const response = await fetch(
        CART_API_URL,
        {
            headers,
            cache: "no-store",
        }
    );

    const data =
        await response.json();

    await saveCartToken(response);

    if (!response.ok) {
        return Response.json(
            data,
            {
                status:
                    response.status,
            }
        );
    }

    return Response.json(
        normalizeCart(data)
    );
}


export async function POST(
    request: Request
) {

    const body =
        await request.json();

    const headers =
        await getWooHeaders(true);

    const response = await fetch(
        `${CART_API_URL}/add-item`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                id: body.id,
                quantity: body.quantity,
            }),
            cache: "no-store",
        }
    );

    const data =
        await response.json();

    await saveCartToken(response);

    if (!response.ok) {
        return Response.json(
            data,
            {
                status:
                    response.status,
            }
        );
    }

    return Response.json(
        normalizeCart(data)
    );
}


export async function PUT(
    request: Request
) {

    const body =
        await request.json();

    const headers =
        await getWooHeaders(true);

    const response = await fetch(
        `${CART_API_URL}/update-item`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                key: body.key,
                quantity: body.quantity,
            }),
            cache: "no-store",
        }
    );

    const data =
        await response.json();

    await saveCartToken(response);

    if (!response.ok) {
        console.error(
            "Update cart error:",
            data
        );

        return Response.json(
            data,
            {
                status:
                    response.status,
            }
        );
    }

    return Response.json(
        normalizeCart(data)
    );
}


export async function DELETE(
    request: Request
) {

    const body =
        await request.json();

    const headers =
        await getWooHeaders(true);

    const response = await fetch(
        `${CART_API_URL}/remove-item`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                key: body.key,
            }),
            cache: "no-store",
        }
    );

    const data =
        await response.json();

    await saveCartToken(response);

    if (!response.ok) {
        console.error(
            "Remove cart error:",
            data
        );

        return Response.json(
            data,
            {
                status:
                    response.status,
            }
        );
    }

    return Response.json(
        normalizeCart(data)
    );
}