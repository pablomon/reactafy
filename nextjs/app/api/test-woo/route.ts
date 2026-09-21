import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/services/wordpress";

export async function GET() {
    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const url =
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/add-item`;

    const results: number[] = [];

    for (let i = 0; i < 3; i++) {
        const start = performance.now();

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                id: 686,       // pon aquí un ID real
                quantity: 1,
            }),
            cache: "no-store",
        });

        await response.arrayBuffer();

        results.push(
            Math.round(performance.now() - start)
        );

        console.log(
            `add-item ${i + 1}: ${results[i]} ms`,
            response.status
        );
    }

    return Response.json({
        results,
    });
}