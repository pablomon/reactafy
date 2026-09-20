import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/services/wordpress";

export async function GET(request: Request) {

    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const orderId = searchParams.get("order");

    if (!code || !orderId) {
        return new Response(
            "Missing code or order",
            {
                status: 400,
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    }

    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
        return Response.json(
            data,
            {
                status: response.status,
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    }

    if (!data.token) {
        return new Response(
            "WordPress did not return a token",
            {
                status: 500,
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    }

    const cookieStore = await cookies();

    cookieStore.set("authToken", data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
    });

    cookieStore.delete("cartToken");

    return new Response(null, {
        status: 303,
        headers: {
            Location: `/pedido/${orderId}`,
            "Cache-Control": "private, no-store",
        },
    });
}