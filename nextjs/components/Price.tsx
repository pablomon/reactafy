"use client";

import { Suspense, use } from "react";
import type { ProductPrice } from "@/types/productPrice";
import { formatPrice } from "@/utils/formatPrice";
import { maxTierSaving } from "@/utils/priceTiers";
import SkeletonText from "@/components/skeletons/SkeletonText";
import styles from "./Price.module.css";

type PriceProps = {
    productId: number;
    pricesPromise: Promise<Record<number, ProductPrice>>;
    // true (tarjetas): "Desde X" con el precio del último tramo.
    // false (ficha): el precio de 1 caja; los tramos van en la tabla.
    showFrom?: boolean;
    // Badge "Hasta -20%" si hay descuento por volumen (ficha)
    showSaving?: boolean;
};

export default function Price(props: PriceProps) {
    return (
        <Suspense fallback={<PriceSkeleton />}>
            <PriceContent {...props} />
        </Suspense>
    );
}

function PriceContent({
    productId,
    pricesPromise,
    showFrom = true,
    showSaving = false,
}: PriceProps) {
    const prices = use(pricesPromise);
    const price = prices[productId];

    if (!price) {
        return null;
    }

    const isFrom = showFrom && price.fromPrice !== null;
    // `?? []`: una respuesta de precios antigua (caché de LiteSpeed) puede no traer tiers
    const saving = showSaving ? maxTierSaving(price.tiers ?? []) : 0;

    return (
        <>
            <p className={styles.price}>
                {isFrom && "Desde "}
                {formatPrice(isFrom && price.fromPrice ? price.fromPrice : price.price)}

                {saving > 0 && (
                    <span className={styles.badge}>Hasta -{saving}%</span>
                )}
            </p>

            <p className={styles.tax}>
                (IVA inc.)
            </p>
        </>
    );
}

// Mientras llegan los precios: las mismas dos líneas (precio e "IVA
// inc.") con sus clases reales, así la tarjeta no cambia de alto.
function PriceSkeleton() {
    return (
        // Fragmento, no <div>: igual que el precio real, son dos hijos
        // directos del padre (en la ficha, el gap del flex los separa)
        <>
            <p className={styles.price} aria-hidden="true">
                <SkeletonText width="6em" />
            </p>
            <p className={styles.tax} aria-hidden="true">
                <SkeletonText width="5em" />
            </p>
        </>
    );
}
