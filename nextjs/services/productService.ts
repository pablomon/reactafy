import { siteConfig } from "@/config/site";
import type { Product, ProductsResponse } from "@/types/product";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function getProducts(
    page: number = 1
): Promise<ProductsResponse> {
    const start = performance.now();

    const response = await fetch(
        `${API_URL}/products?page=${page}&perPage=${siteConfig.PRODUCTS_PER_PAGE}`
    );

    const fetchTime = performance.now() - start;

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    const totalTime = performance.now() - start;

    console.log("GET PRODUCTS", {
        page,
        fetch: Math.round(fetchTime),
        json: Math.round(totalTime - fetchTime),
        total: Math.round(totalTime),
    });

    return data;
}

export async function getProduct(
    id: string
): Promise<Product> {
    const response = await fetch(
        `${API_URL}/products/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    return response.json();
}