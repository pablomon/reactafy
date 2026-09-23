import {ProductPrice} from "@/types/productPrice";
import {siteConfig} from "@/config/site";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function getProductPrices(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const ids = productIds.join(",");

    const start = performance.now();

    const response = await fetch(
        `${API_URL}/products/pricing?ids=${ids}`
    );

    const fetchTime = performance.now() - start;

    if (!response.ok) {
        throw new Error("Failed to fetch product prices");
    }

    const data = await response.json();

    const totalTime = performance.now() - start;

    console.log("GET PRODUCT PRICES", {
        ids: productIds.length,
        fetch: Math.round(fetchTime),
        json: Math.round(totalTime - fetchTime),
        total: Math.round(totalTime),
    });

    return data;
}