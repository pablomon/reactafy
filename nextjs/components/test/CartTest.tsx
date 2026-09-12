"use client";

import { useContext } from "react";
import { CartContext } from "@/app/cart/CartContext";

export default function CartTest() {
    const { cart } = useContext(CartContext);

    return (
        <div>
            <p>Productos: {cart?.items_count ?? 0}</p>
            <p>
                Total: {cart?.totals.total_price ?? "0"}
            </p>
        </div>
    );
}