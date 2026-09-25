"use client";

import CartLines from "@/components/cart/CartLines";
import CartSummary from "@/components/cart/CartSummary";
import styles from "@/components/cart/Cart.module.css";

// Respaldo del panel "Cesta" para enlaces directos a /carrito.
export default function CartPage() {
    return (
        <main className={styles.page}>
            <h1 className={styles.pageTitle}>Cesta</h1>

            <div className={styles.pageLayout}>
                <CartLines />
                <CartSummary />
            </div>
        </main>
    );
}
