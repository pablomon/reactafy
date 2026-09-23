import {siteConfig} from "@/config/site";


export async function GET() {
    const url =
        `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1/products?page=3&perPage=20`;

    const results = [];

    for (let i = 1; i <= 5; i++) {
        const start = performance.now();

        const response = await fetch(url, {
            cache: "no-store",
        });

        const fetchTime =
            performance.now() - start;

        const jsonStart = performance.now();

        await response.json();

        const jsonTime =
            performance.now() - jsonStart;

        results.push({
            request: i,
            fetch: Math.round(fetchTime),
            json: Math.round(jsonTime),
            total: Math.round(
                fetchTime + jsonTime
            ),
            status: response.status,
        });
    }

    return Response.json(results);
}