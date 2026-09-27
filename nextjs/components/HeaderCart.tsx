"use client";

import { useContext, useState } from "react";

import styles from "./Header.module.css";
import { CartContext } from "@/app/context/CartContext";

export default function HeaderCart() {
    const { cart, openCart } = useContext(CartContext);

    // Se suma a partir de las líneas (y no de items_count) para que
    // el contador siga los cambios optimistas del carrito al momento.
    const count =
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    // Zoom del globo cuando SUBE el número (se añade algo). Patrón
    // "estado derivado": comparamos con el valor anterior durante el
    // render, sin useEffect. null = el carrito aún no había cargado: la
    // primera carga (0 → 3) no es "añadir", así que no anima.
    const current = cart ? count : null;
    const [previous, setPrevious] = useState(current);
    const [bumps, setBumps] = useState(0);

    if (current !== previous) {
        if (previous !== null && current !== null && current > previous) {
            setBumps(bumps + 1);
        }
        setPrevious(current);
    }

    return (
        <button
            type="button"
            className={`${styles.iconLink} ${styles.iconButtonReset}`}
            aria-label={`Abrir la cesta (${count} productos)`}
            aria-haspopup="dialog"
            onClick={openCart}
        >
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                <path
                    d="M3.7.9h11.6l2.9 3.5v12.3c0 1.1-1 1.9-2 1.9H2.8c-1 0-2-.8-2-1.9V4.4L3.7.9Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                />
                <path d="M.8 4.4h17.4" stroke="currentColor" />
                <path
                    d="M6 7.5a3.5 3.5 0 0 0 7 0"
                    stroke="currentColor"
                    strokeLinecap="round"
                />
            </svg>

            {/* key={bumps}: cada "añadir" crea un <span> nuevo, y un
                elemento nuevo vuelve a reproducir su animación CSS */}
            <span
                key={bumps}
                className={bumps > 0 ? `${styles.badge} ${styles.badgeBump}` : styles.badge}
            >
                {count}
            </span>
        </button>
    );
}
