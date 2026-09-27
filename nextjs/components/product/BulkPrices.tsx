"use client";

import { Suspense, use } from "react";

import type { ProductPrice } from "@/types/productPrice";
import { formatPrice } from "@/utils/formatPrice";
import { savingPercent, tierLabel } from "@/utils/priceTiers";
import styles from "./Product.module.css";

type BulkPricesProps = {
    productId: number;
    pricesPromise: Promise<Record<number, ProductPrice>>;
};

// Tabla "Precio por volumen" con los tramos de ADP. Lee la MISMA promesa
// que <Price> (una sola petición). Tiene su propio <Suspense> para no
// frenar el resto de la ficha; sin tramos no pinta nada, por eso el
// fallback es null (no reserva hueco en productos sin tabla).
export default function BulkPrices(props: BulkPricesProps) {
    return (
        <Suspense fallback={null}>
            <BulkPricesContent {...props} />
        </Suspense>
    );
}

function BulkPricesContent({ productId, pricesPromise }: BulkPricesProps) {
    const tiers = use(pricesPromise)[productId]?.tiers ?? [];

    if (tiers.length < 2) {
        return null;
    }

    const base = tiers[0].price;

    return (
        <div className={styles.bulk}>
            <p className={styles.bulkTitle}>Precio por volumen</p>

            <table className={styles.bulkTable}>
                <thead>
                    <tr>
                        <th scope="col">Cajas</th>
                        <th scope="col">Precio por caja</th>
                        <th scope="col">Ahorro</th>
                    </tr>
                </thead>

                <tbody>
                    {tiers.map((tier) => {
                        const saving = savingPercent(base, tier.price);

                        return (
                            <tr key={tier.from}>
                                <td>{tierLabel(tier)}</td>
                                <td>{formatPrice(tier.price)}</td>
                                <td className={styles.bulkSaving}>
                                    {saving > 0 ? `-${saving}%` : "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
