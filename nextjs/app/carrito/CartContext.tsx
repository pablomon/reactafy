"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { Cart } from "@/types/cart";

import {
    getCart,
    addItem as addCartItem,
    updateItem as updateCartItem,
    removeItem as removeCartItem,
} from "@/services/cartService";

type CartContextType = {
    cart: Cart | null;
    addItem: (
        id: number,
        quantity: number
    ) => Promise<void>;
    updateItem: (
        key: string,
        quantity: number
    ) => Promise<void>;
    removeItem: (
        key: string
    ) => Promise<void>;
};

type CartProviderProps = {
    children: ReactNode;
};

export const CartContext =
    createContext<CartContextType>({
        cart: null,
        addItem: async () => {},
        updateItem: async () => {},
        removeItem: async () => {},
    });

export default function CartProvider(
    props: CartProviderProps
) {
    const [cart, setCart] =
        useState<Cart | null>(null);

    useEffect(() => {
        async function loadCart() {
            try {
                const cart =
                    await getCart();

                setCart(cart);
            } catch (error) {
                console.error(
                    "Failed to load cart:",
                    error
                );
            }
        }

        loadCart();
    }, []);

    async function addItem(
        id: number,
        quantity: number
    ) {
        const cart =
            await addCartItem(
                id,
                quantity
            );

        setCart(cart);
    }

    async function updateItem(
        key: string,
        quantity: number
    ) {
        const cart =
            await updateCartItem(
                key,
                quantity
            );

        setCart(cart);
    }

    async function removeItem(
        key: string
    ) {
        const cart =
            await removeCartItem(key);

        setCart(cart);
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