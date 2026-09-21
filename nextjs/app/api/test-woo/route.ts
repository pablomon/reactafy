import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

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
        headers.Authorization =
            `Bearer ${authToken}`;
    }

    if (cartToken) {
        headers["Cart-Token"] =
            cartToken;
    }

    const url =
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/add-item`;

    const results = [];

    for (let i = 0; i < 6; i++) {
        const start = performance.now();

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                id: 686,
                quantity: 1,
            }),
            cache: "no-store",
        });

        const data = await response.json();

        const elapsed = Math.round(
            performance.now() - start
        );

        results.push({
            request: i + 1,
            elapsed,
            status: response.status,
            ok: response.ok,
            itemsCount: data.items_count,
        });

        console.log({
            request: i + 1,
            elapsed,
            status: response.status,
            ok: response.ok,
            itemsCount: data.items_count,
        });
    }

    return Response.json({
        results,
    });
}