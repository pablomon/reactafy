"use client";

import { Suspense, use } from "react";
import type { ProductPrice } from "@/types/productPrice";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./Price.module.css";

type PriceProps = {
    productId: number;
    pricesPromise: Promise<Record<number, ProductPrice>>;
};

export default function Price({
                                  productId,
                                  pricesPromise,
                              }: PriceProps) {
    return (
        <Suspense fallback={<p className={styles.price}>...</p>}>
            <PriceContent
                productId={productId}
                pricesPromise={pricesPromise}
            />
        </Suspense>
    );
}

function PriceContent({
                          productId,
                          pricesPromise,
                      }: PriceProps) {
    const prices = use(pricesPromise);
    const price = prices[productId];

    if (!price) {
        return null;
    }

    return (
        <>
            <p className={styles.price}>
                {price.fromPrice !== null && "Desde "}
                {formatPrice(price.fromPrice ?? price.price)}
            </p>

            <p className={styles.tax}>
                (IVA inc.)
            </p>
        </>
    );
}