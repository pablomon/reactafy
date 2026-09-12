"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

type CartLine = {
    key: string;
    id: number;
    quantity: number;
    name: string;
    images: {
        id: number;
        src: string;
        thumbnail: string;
        alt: string;
    }[];
    variation: {
        raw_attribute: string;
        attribute: string;
        value: string;
    }[];
    prices: {
        price: string;
        currency_code: string;
        currency_minor_unit: number;
    };
    totals: {
        line_subtotal: string;
        line_total: string;
        currency_code: string;
        currency_minor_unit: number;
    };
};

type Cart = {
    items: CartLine[];
    items_count: number;
    totals: {
        total_items: string;
        total_price: string;
        total_tax: string;
        currency_code: string;
        currency_minor_unit: number;
    };
};

type CartContextType = {
    cart: Cart | null;
    addItem: (id: number, quantity: number) => Promise<void>;
    updateItem: (key: string, quantity: number) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
};

type CartProviderProps = {
    children: ReactNode;
};

export const CartContext = createContext<CartContextType>({
    cart: null,
    addItem: async () => {},
    updateItem: async () => {},
    removeItem: async () => {},
});

export default function CartProvider(
    props: CartProviderProps
) {
    const [cart, setCart] = useState<Cart | null>(null);

    useEffect(() => {
        async function loadCart() {
            const response = await fetch("/api/cart");

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setCart(data);
        }

        loadCart();
    }, []);

    async function addItem(
        id: number,
        quantity: number
    ) {
        const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                quantity,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            console.error("Add to cart error:", error);

            throw new Error("Failed to add item");
        }

        const data = await response.json();

        setCart(data);
    }

    async function updateItem(
        key: string,
        quantity: number
    ) {
        const response = await fetch("/api/cart", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
                quantity,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            console.error("Update cart error:", error);

            throw new Error("Failed to update item");
        }

        const data = await response.json();

        setCart(data);
    }

    async function removeItem(key: string) {
        const response = await fetch("/api/cart", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            console.error("Remove cart error:", error);

            throw new Error("Failed to remove item");
        }

        const data = await response.json();

        setCart(data);
    }
    
    return (
        <CartContext.Provider
            value={{
                cart,
                addItem,
                updateItem,
                removeItem,
            }}
        >
            {props.children}
        </CartContext.Provider>
    );
}