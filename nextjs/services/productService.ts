import type { ProductsResponse } from "@/types/product";

const API_URL = "https://staging.aguafy.com/wp-json/reactafy/v1";

export async function getProducts(): Promise<ProductsResponse> {
    const response = await fetch(
        `${API_URL}/products?page=1&perPage=20`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}