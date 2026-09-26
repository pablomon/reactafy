"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import styles from "./ProductGrid.module.css";
import ProductBatch from "@/components/ProductBatch";

type ProductBatchData = {
    page: number;
    products: Product[];
    pricesPromise: Promise<Record<number, ProductPrice>>;
};

type ProductGridProps = {
    initialProducts: Product[];
    initialPage: number;
    totalPages: number;
    initialPricesPromise: Promise<
        Record<number, ProductPrice>
    >;
    // Lo mismo que se pidió en el servidor, para que "Cargar más" siga igual:
    // categoría (con sus subcategorías) y facetas ({ brand: "perrier" }).
    category?: string;
    filters?: Record<string, string>;
};

async function getProductPricesClient(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const ids = productIds.join(",");

    const response = await fetch(
        `/api/products/pricing/?ids=${ids}`
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
                                        category,
                                        filters,
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

    // Lo mismo que se pidió, con la página siguiente: brand=perrier&page=3
    const nextPageQuery = new URLSearchParams({
        ...filters,
        page: String(currentPage + 1),
    }).toString();

    async function loadMore() {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);

        const nextPage = currentPage + 1;

        try {
            const query = new URLSearchParams({ ...filters, page: String(nextPage) });

            if (category) {
                query.set("category", category);
            }

            const response = await fetch(`/api/products/?${query}`);

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
                // Enlace real a la página siguiente: Google (y quien no tenga
                // JavaScript) llega a todos los productos. Con JavaScript se
                // intercepta el clic y se añaden los productos sin recargar.
                <a
                    href={`?${nextPageQuery}`}
                    className={styles.loadMore}
                    aria-disabled={loading}
                    onClick={(event) => {
                        event.preventDefault();
                        loadMore();
                    }}
                >
                    {loading
                        ? "Cargando..."
                        : "Cargar más"}
                </a>
            )}
        </>
    );
}