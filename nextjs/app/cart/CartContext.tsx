"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

type Cart = {
    items: unknown[];
    items_count: number;
    totals: {
        total_price: string;
    };
};

type CartContextType = {
    cart: Cart | null;
};

type CartProviderProps = {
    children: ReactNode;
};

export const CartContext = createContext<CartContextType>({
    cart: null,
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

    return (
        <CartContext.Provider value={{ cart }}>
            {props.children}
        </CartContext.Provider>
    );
}