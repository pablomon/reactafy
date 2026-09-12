"use client";

import { useContext } from "react";
import { CartContext } from "@/app/cart/CartContext";

export default function CartPage() {
    const context = useContext(CartContext);

    const cart = context.cart;

    if (!cart) {
        return <p>Cargando carrito...</p>;
    }

    if (cart.items.length === 0) {
        return <p>El carrito está vacío.</p>;
    }

    return (
        <main>
            <h1>Carrito</h1>

            {cart.items.map((item) => (
                <div key={item.key}>
                    <p>Producto: {item.id}</p>
                    <p>Cantidad: {item.quantity}</p>
                </div>
            ))}

            <p>
                Total: {cart.totals.total_price}
            </p>
        </main>
    );
}