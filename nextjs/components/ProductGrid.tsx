"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import styles from "./ProductGrid.module.css";
import ProductBatch from "@/components/ProductBatch";

interface ProductBatchData {
    page: number;
    products: Product[];
    pricesPromise: Promise<Record<number, ProductPrice>>;
}

interface ProductGridProps {
    initialProducts: Product[];
    initialPage: number;
    totalPages: number;
    initialPricesPromise: Promise<
        Record<number, ProductPrice>
    >;
}

async function getProductPricesClient(
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
        throw new Error("Failed to fetch prices");
    }

    return response.json();
}

export default function ProductGrid({
                                        initialProducts,
                                        initialPage,
                                        totalPages,
                                        initialPricesPromise,
                                    }: ProductGridProps) {

    const [batches, setBatches] = useState<ProductBatchData[]>([
        {
            page: initialPage,
            products: initialProducts,
            pricesPromise: initialPricesPromise,
        },
    ]);

    const [loading, setLoading] = useState(false);

    const currentPage =
        batches[batches.length - 1].page;

    const hasMore = currentPage < totalPages;

    async function loadMore() {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);

        const nextPage = currentPage + 1;

        try {
            const response = await fetch(
                `/api/products?page=${nextPage}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch products"
                );
            }

            const data = await response.json();

            const productIds = data.products.map(
                (product: Product) => product.id
            );

            const pricesPromise =
                getProductPricesClient(productIds);

            setBatches((current) => [
                ...current,
                {
                    page: nextPage,
                    products: data.products,
                    pricesPromise,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={styles.grid}>
                {batches.map((batch) => (
                    <ProductBatch
                        key={batch.page}
                        products={batch.products}
                        pricesPromise={batch.pricesPromise}
                    />
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading
                        ? "Cargando..."
                        : "Cargar más"}
                </button>
            )}
        </>
    );
}