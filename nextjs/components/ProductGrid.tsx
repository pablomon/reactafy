"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import styles from "./ProductGrid.module.css";
import ProductBatch from "@/components/ProductBatch";

interface ProductBatchData {
    page: number;
    products: Product[];
}

interface ProductGridProps {
    initialProducts: Product[];
    initialPage: number;
    totalPages: number;
}

export default function ProductGrid({
                                        initialProducts,
                                        initialPage,
                                        totalPages,
                                    }: ProductGridProps) {
    const [batches, setBatches] = useState<ProductBatchData[]>([
        {
            page: initialPage,
            products: initialProducts,
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

            setBatches((current) => [
                ...current,
                {
                    page: nextPage,
                    products: data.products,
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