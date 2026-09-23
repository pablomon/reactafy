"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import ProductCard from "@/components/ProductCard";

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
    const [products, setProducts] = useState(initialProducts);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);

    const productIds = useMemo(
        () => products.map((product) => product.id),
        [products]
    );

    const pricesPromise = useMemo(
        () => getProductPrices(productIds),
        [productIds]
    );

    const hasMore = page < totalPages;

    async function loadMore() {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);

        const nextPage = page + 1;

        try {
            const response = await fetch(
                `/api/products?page=${nextPage}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }

            const data = await response.json();

            setProducts((current) => [
                ...current,
                ...data.products,
            ]);

            setPage(nextPage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        pricesPromise={pricesPromise}
                    />
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : "Cargar más"}
                </button>
            )}
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
        throw new Error("Failed to fetch product prices");
    }

    return response.json();
}