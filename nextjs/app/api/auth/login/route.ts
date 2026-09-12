import { cookies } from "next/headers";

const WORDPRESS_URL =
    "https://staging.aguafy.com";

export async function POST(request: Request) {

    const body = await request.json();

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: body.username,
                password: body.password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        return Response.json(
            data,
            { status: response.status }
        );
    }

    const cookieStore = await cookies();

    cookieStore.set(
        "authToken",
        data.token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        }
    );

    return Response.json({
        user_email: data.user_email,
        user_display_name: data.user_display_name,
    });
}