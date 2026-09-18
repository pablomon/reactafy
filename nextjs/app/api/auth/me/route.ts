import { cookies } from "next/headers";

import { WORDPRESS_URL } from "@/services/wordpress";

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