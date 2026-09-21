import { WORDPRESS_URL } from "@/services/wordpress";

export async function GET() {
    const url =
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart`;

    const results = [];

    for (let i = 0; i < 3; i++) {
        const start = performance.now();

        await fetch(url, {
            cache: "no-store",
        });

        results.push(
            Math.round(performance.now() - start)
        );
    }

    console.log("Node fetch:", results);
    
    return Response.json({ results });
}