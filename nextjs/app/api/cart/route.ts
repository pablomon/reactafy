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