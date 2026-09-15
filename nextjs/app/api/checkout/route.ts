import { cookies } from "next/headers";

const WORDPRESS_URL =
    "https://staging.aguafy.com";

export async function POST() {

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    if (!authToken) {
        return Response.json(
            {
                message: "Not authenticated",
            },
            {
                status: 401,
            }
        );
    }

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/reactafy/v1/checkout-handoff`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        return Response.json(
            data,
            {
                status: response.status,
            }
        );
    }

    return Response.json(data);
}