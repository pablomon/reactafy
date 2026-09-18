"use client";

import { useContext } from "react";
import { CartContext } from "@/app/carrito/CartContext";

type AddToCartButtonProps = {
    productId: number;
};

export default function AddToCartButton(
    props: AddToCartButtonProps
) {
    const context = useContext(CartContext);

    const addItem = context.addItem;

    return (
        <div>
            <button
                type="button"
                onClick={() => addItem(props.productId, 1)}
            >
                Añadir
            </button>
        </div>
    );
}