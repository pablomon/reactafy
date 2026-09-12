"use client";

import { useState } from "react";

export default function AddToCartButton() {
    const [quantity, setQuantity] = useState(0);

    return (
        <div>
            <p>Productos: {quantity}</p>

            <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
            >
                Añadir
            </button>
        </div>
    );
}