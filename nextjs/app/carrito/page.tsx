"use client";

import styles from "./page.module.css";
import { formatPrice } from "@/utils/formatPrice";

import { useContext } from "react";
import { CartContext } from "@/app/context/CartContext";
import CheckoutButton from "@/components/CheckoutButton";

export default function CartPage() {
    const context = useContext(CartContext);

    const cart = context.cart;
    const changeQuantity = context.changeQuantity;

    if (!cart) {
        return <p>Cargando carrito...</p>;
    }

    if (cart.items.length === 0 || !cart.totals) {
        return <p>El carrito está vacío.</p>;
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Carrito</h1>

            <div className={styles.layout}>
                <section className={styles.items}>
                    {cart.items.map((item) => (
                        <article
                            key={item.key}
                            className={styles.item}
                        >
                            <img
                                className={styles.image}
                                src={item.images[0]?.thumbnail}
                                alt={
                                    item.images[0]?.alt ??
                                    item.name
                                }
                                width={120}
                                height={120}
                            />

                            <div className={styles.info}>
                                <h2 className={styles.name}>
                                    {item.name}
                                </h2>

                                <div className={styles.attributes}>
                                    {item.variation.map(
                                        (attribute) => (
                                            <p
                                                key={
                                                    attribute.raw_attribute
                                                }
                                            >
                                                {attribute.attribute}:{" "}
                                                {attribute.value}
                                            </p>
                                        )
                                    )}
                                </div>

                                <div className={styles.bottom}>
                                    <div
                                        className={
                                            styles.quantity
                                        }
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(
                                                    item.key,
                                                    -1
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(
                                                    item.key,
                                                    1
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className={styles.price}>
                                        {formatPrice(
                                            item.totals.line_total,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <aside className={styles.summary}>
                    <h2>Resumen</h2>

                    <div className={styles.total}>
                        <span>Total</span>
                        <strong>
                            {formatPrice(
                                cart.totals.total_price,
                            )}
                        </strong>
                    </div>

                    <CheckoutButton />
                </aside>
            </div>
        </main>
    );
}