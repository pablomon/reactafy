"use client";

import { useContext } from "react";

import { CartContext } from "@/app/context/CartContext";
import CheckoutButton from "@/components/CheckoutButton";
import { useStore } from "@/app/context/StoreContext";
import { formatPrice } from "@/utils/formatPrice";
import { moneyToNumber, numberToMoney } from "@/utils/money";
import styles from "./Cart.module.css";

export default function CartSummary() {
    const { cart, isSyncing } = useContext(CartContext);
    const store = useStore();

    // Ajustes de la tienda en Woo (Ajustes → Tienda)
    const MIN_ORDER = moneyToNumber(store.minOrder);
    const MAX_ORDER = store.maxOrder ? moneyToNumber(store.maxOrder) : null;

    const totals = cart?.totals ?? null;
    const isEmpty = !cart || cart.items.length === 0 || !totals;

    // Precio estimado = total de Woo. En el carrito aún no hay envío
    // (depende de la dirección), así que son productos + tasas.
    const estimated = isEmpty ? 0 : moneyToNumber(totals.total_price);
    const remaining = Math.max(0, MIN_ORDER - estimated);
    const reachesMinimum = remaining === 0;
    const exceedsMaximum = MAX_ORDER !== null && estimated > MAX_ORDER;
    const progress = Math.min(1, estimated / MIN_ORDER);

    const remainingText = totals
        ? formatPrice(numberToMoney(remaining, totals.total_price))
        : formatPrice(store.minOrder);

    return (
        <div className={styles.summary}>
            <div className={styles.progress}>
                <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-label="Progreso hasta el pedido mínimo"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                >
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                <p className={styles.progressText} aria-live="polite">
                    {reachesMinimum
                        ? "¡Ya puedes realizar tu pedido!"
                        : `Te faltan ${remainingText} para poder realizar el pedido.`}
                </p>
            </div>

            {isEmpty ? (
                <p className={styles.empty}>Tu carrito está vacío.</p>
            ) : (
                <>
                    <dl className={styles.totals}>
                        <div className={styles.totalRow}>
                            <dt>Subtotal</dt>
                            <dd>{formatPrice(totals.total_items)}</dd>
                        </div>
                        <div className={styles.totalRow}>
                            <dt>Tasas</dt>
                            <dd>{formatPrice(totals.total_tax)}</dd>
                        </div>
                    </dl>

                    <p className={styles.note}>
                        Los gastos de envío y las promociones se calculan en el
                        momento de pago.
                    </p>

                    <div className={styles.estimated}>
                        <span>Precio estimado</span>
                        <span>{formatPrice(totals.total_price)}</span>
                    </div>

                    {exceedsMaximum && store.maxOrder && (
                        <p className={styles.progressText} role="alert">
                            El pedido máximo es de {formatPrice(store.maxOrder)}.
                            Quita algún producto para poder continuar.
                        </p>
                    )}
                </>
            )}

            <CheckoutButton
                disabled={isEmpty || !reachesMinimum || exceedsMaximum || isSyncing}
                syncing={isSyncing}
            />
        </div>
    );
}
