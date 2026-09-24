import { cookies } from "next/headers";
import {ProductPrice} from "@/types/productPrice";
import {siteConfig} from "@/config/site";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Solo para el servidor. Lee la sesión de la cookie para que un
// usuario logueado reciba sus precios también en el primer render,
// igual que en "Cargar más" (que pasa por /api/products/pricing).
export async function getProductPrices(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const ids = productIds.join(",");

    const authToken =
        (await cookies()).get("authToken")?.value;

    const start = performance.now();

    const response = await fetch(
        `${API_URL}/products/pricing?ids=${ids}`,
        {
            headers: authToken
                ? { Authorization: `Bearer ${authToken}` }
                : {},
            // Precios por usuario: nunca se cachean.
            cache: "no-store",
        }
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