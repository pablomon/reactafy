import { WORDPRESS_URL } from "@/services/wordpress";

export async function GET() {
    const start = performance.now();

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart`,
        {
            cache: "no-store",
        }
    );

    const elapsed = Math.round(
        performance.now() - start
    );

    console.log(
        `Woo desde Node: ${elapsed} ms`
    );

    return Response.json({
        status: response.status,
        elapsed,
    });
}