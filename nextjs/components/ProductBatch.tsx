"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import ProductCard from "@/components/ProductCard";

interface ProductBatchProps {
    products: Product[];
}

export default function ProductBatch({
                                         products,
                                     }: ProductBatchProps) {
    const productIds = useMemo(
        () => products.map((product) => product.id),
        [products]
    );

    const [pricesPromise, setPricesPromise] =
        useState<Promise<Record<number, ProductPrice>> | null>(null);

    useEffect(() => {
        setPricesPromise(
            getProductPrices(productIds)
        );
    }, [productIds]);

    if (!pricesPromise) {
        return (
            <>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </>
        );
    }

    return (
        <>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    pricesPromise={pricesPromise}
                />
            ))}
        </>
    );
}

async function getProductPrices(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const ids = productIds.join(",");

    const response = await fetch(
        `/api/products/pricing?ids=${ids}`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch product prices"
        );
    }

    return response.json();
}