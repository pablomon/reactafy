import type { Cart } from "@/types/cart";

const CART_API_URL = "/api/cart";

export async function getCart(): Promise<Cart> {
    const response = await fetch(
        CART_API_URL
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch cart"
        );
    }

    return response.json();
}

export async function addItem(
    id: number,
    quantity: number
): Promise<Cart> {
    const response = await fetch(
        CART_API_URL,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                quantity,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to add item"
        );
    }

    return response.json();
}

export async function updateItem(
    key: string,
    quantity: number
): Promise<Cart> {
    const response = await fetch(
        CART_API_URL,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
                quantity,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to update item"
        );
    }

    return response.json();
}

export async function removeItem(
    key: string
): Promise<Cart> {
    const response = await fetch(
        CART_API_URL,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to remove item"
        );
    }

    return response.json();
}