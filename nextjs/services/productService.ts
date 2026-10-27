import { siteConfig } from "@/config/site";
import { cached, CacheTag } from "@/services/wpCache";
import type {Product, ProductDetail, ProductsResponse} from "@/types/product";
import type { Brand, BrandSummary } from "@/types/brand";
import type { Category } from "@/types/category";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Qué productos pedir. Todo opcional: {} = primera página de toda la tienda.
export type ProductQuery = {
    page?: number;
    // Slug de categoría: incluye sus subcategorías
    category?: string;
    // Facetas, tal cual las espera WordPress: { brand: "perrier", envase: "lata,vidrio" }
    filters?: Record<string, string>;
};

export async function getProducts(
    { page = 1, category, filters = {} }: ProductQuery = {}
): Promise<ProductsResponse> {
    const query = new URLSearchParams({
        ...filters,
        page: String(page),
        perPage: String(siteConfig.PRODUCTS_PER_PAGE),
    });

    if (category) {
        query.set("category", category);
    }

    const response = await fetch(
        `${API_URL}/products?${query}`,
        cached(CacheTag.Catalogo)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

// Traduce una URL de la tienda al producto que le corresponde.
// Devuelve null si el grupo no existe (404 de WordPress).
export async function resolveProduct(
    group: string,
    product: string | null,
    legacyParams: Record<string, string>
): Promise<ProductDetail | null> {
    const query = new URLSearchParams({ group, ...legacyParams });

    if (product) {
        query.set("product", product);
    }

    const response = await fetch(
        `${API_URL}/products/resolve?${query}`,
        cached(CacheTag.Catalogo)
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
        `${API_URL}/brands/${encodeURIComponent(slug)}`,
        cached(CacheTag.Catalogo)
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch brand");
    }

    return response.json();
}

// Todas las marcas con productos, por nombre (panel "Buscar").
export async function getBrands(): Promise<BrandSummary[]> {
    const response = await fetch(
        `${API_URL}/brands`,
        cached(CacheTag.Catalogo)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch brands");
    }

    return response.json();
}

// Datos de una categoría. null si no existe (404 de WordPress).
export async function getCategory(slug: string): Promise<Category | null> {
    const response = await fetch(
        `${API_URL}/categories/${encodeURIComponent(slug)}`,
        cached(CacheTag.Catalogo)
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch category");
    }

    return response.json();
}

// Todos los productos publicados, página a página (la API da 100 como máximo).
//
// Se pagina por totalPages y se acaba cuando se agotan, NO se cuenta contra
// "total": la API cuenta productos que luego no puede pintar y el bucle
// esperaría productos que no llegan.
export async function getAllProducts(): Promise<Product[]> {
    const all: Product[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const response = await fetch(
            `${API_URL}/products?page=${page}&perPage=100`,
            cached(CacheTag.Catalogo)
        );

        if (!response.ok) {
            throw new Error("Failed to fetch all products");
        }

        const data: ProductsResponse = await response.json();

        all.push(...data.products);
        totalPages = data.pagination.totalPages;
        page++;
    } while (page <= totalPages);

    return all;
}
