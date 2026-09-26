import { siteConfig } from "@/config/site";
import type { Product, ProductsResponse } from "@/types/product";
import type { Brand } from "@/types/brand";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// brand: slug de marca para filtrar (/brand/{slug}/). Sin él, toda la info.
export async function getProducts(
    page: number = 1,
    brand?: string
): Promise<ProductsResponse> {
    const start = performance.now();

    const query = new URLSearchParams({
        page: String(page),
        perPage: String(siteConfig.PRODUCTS_PER_PAGE),
    });

    if (brand) {
        query.set("brand", brand);
    }

    const response = await fetch(`${API_URL}/products?${query}`);

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

// Traduce una URL de la tienda al producto que le corresponde.
// Devuelve null si el grupo no existe (404 de WordPress).
export async function resolveProduct(
    group: string,
    product: string | null,
    legacyParams: Record<string, string>
): Promise<Product | null> {
    const query = new URLSearchParams({ group, ...legacyParams });

    if (product) {
        query.set("product", product);
    }

    const response = await fetch(
        `${API_URL}/products/resolve?${query}`
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to resolve product");
    }

    return response.json();
}

// Datos de una marca. null si no existe (404 de WordPress).
export async function getBrand(slug: string): Promise<Brand | null> {
    const response = await fetch(
        `${API_URL}/brands/${encodeURIComponent(slug)}`
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch brand");
    }

    return response.json();
}
