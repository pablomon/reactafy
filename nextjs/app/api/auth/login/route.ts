import { cookies } from "next/headers";

import { setAuthCookie } from "@/services/authCookie";

import { siteConfig } from "@/config/site";
const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

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

    await setAuthCookie(data.token);

    const cookieStore = await cookies();

    cookieStore.delete("cartToken");

    const payload = JSON.parse(
        Buffer.from(
            data.token.split(".")[1],
            "base64url"
        ).toString()
    );

    return Response.json({
        id: Number(payload.data.user.id),
        email: data.user_email,
        name: data.user_display_name,
    });
}