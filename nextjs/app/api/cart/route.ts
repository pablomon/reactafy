import { cookies } from "next/headers";

const WORDPRESS_URL = "https://staging.aguafy.com";

export async function GET() {
    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: HeadersInit = {};

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart`,
        {
            headers,
            cache: "no-store",
        }
    );

    const data = await response.json();

    const newCartToken =
        response.headers.get("Cart-Token");

    if (newCartToken) {
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

    return Response.json(
        data,
        { status: response.status }
    );
}
export async function POST(request: Request) {
    const body = await request.json();

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/add-item`,
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

    const data = await response.json();

    const newCartToken =
        response.headers.get("Cart-Token");

    if (newCartToken) {
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

    return Response.json(
        data,
        { status: response.status }
    );
}

export async function PUT(request: Request) {
    const body = await request.json();

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/update-item`,
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

    const data = await response.json();

    const newCartToken =
        response.headers.get("Cart-Token");

    if (newCartToken) {
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

    if (!response.ok) {
        console.error("Update cart error:", data);

        return Response.json(
            data,
            { status: response.status }
        );
    }

    return Response.json(data);
}

export async function DELETE(request: Request) {
    const body = await request.json();

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/remove-item`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                key: body.key,
            }),
            cache: "no-store",
        }
    );

    const data = await response.json();

    const newCartToken =
        response.headers.get("Cart-Token");

    if (newCartToken) {
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

    if (!response.ok) {
        console.error("Remove cart error:", data);

        return Response.json(
            data,
            { status: response.status }
        );
    }

    return Response.json(data);
}