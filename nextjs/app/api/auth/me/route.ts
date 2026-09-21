import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";
const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

export async function GET() {

    const cookieStore = await cookies();

    const token =
        cookieStore.get("authToken")?.value;

    if (!token) {
        return Response.json(
            { message: "Not authenticated" },
            { status: 401 }
        );
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/reactafy/v1/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    return Response.json(
        data,
        { status: response.status }
    );
}