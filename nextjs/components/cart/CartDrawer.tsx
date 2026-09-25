"use client";

import { useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { CartContext } from "@/app/context/CartContext";
import CartLines from "./CartLines";
import CartSummary from "./CartSummary";
import styles from "./Cart.module.css";

export default function CartDrawer() {
    const { isOpen, closeCart } = useContext(CartContext);
    const pathname = usePathname();
    const closeRef = useRef<HTMLButtonElement>(null);

    // Si se navega a otra página, el panel se cierra.
    useEffect(() => {
        closeCart();
    }, [pathname, closeCart]);

    // Abierto: foco en la X, Escape cierra y la página no hace scroll.
    // Al cerrar, el foco vuelve a donde estaba (el icono del carrito).
    useEffect(() => {
        if (!isOpen) return;

        const previousFocus = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") closeCart();
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
            previousFocus?.focus();
        };
    }, [isOpen, closeCart]);

    // Siempre montado: así el CSS puede animar la entrada y la salida.
    // Cerrado, `visibility: hidden` lo saca del foco y de los lectores
    // de pantalla (ver Cart.module.css).
    return (
        <>
            <div
                className={styles.overlay}
                data-open={isOpen}
                onClick={closeCart}
            />

            <aside
                className={styles.drawer}
                data-open={isOpen}
                aria-hidden={!isOpen}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-drawer-title"
            >
                <header className={styles.drawerHeader}>
                    <h2 id="cart-drawer-title" className={styles.drawerTitle}>
                        Cesta
                    </h2>

                    <button
                        ref={closeRef}
                        type="button"
                        className={styles.drawerClose}
                        aria-label="Cerrar la cesta"
                        onClick={closeCart}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M1 1l14 14M15 1 1 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </header>

                <div className={styles.drawerBody}>
                    <CartLines />
                    <CartSummary />
                </div>
            </aside>
        </>
    );
}
