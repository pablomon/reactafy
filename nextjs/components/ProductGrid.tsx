"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import styles from "./ProductGrid.module.css";
import ProductBatch from "@/components/ProductBatch";
import SkeletonCards from "@/components/skeletons/SkeletonCards";

// Lotes que se cargan solos con el scroll antes de mostrar el botón
const AUTO_LOADS = 2;

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

    // Número de lotes que había cuando empezó la tanda automática actual.
    // Al principio, 1 (la carga inicial). Al pulsar el botón se reinicia.
    const [autoStart, setAutoStart] = useState(1);

    const currentPage =
        batches[batches.length - 1].page;

    const hasMore = currentPage < totalPages;

    // Los primeros lotes se cargan solos al hacer scroll; después aparece el
    // botón "Cargar más" (así el pie de página sigue siendo alcanzable).
    // Cíclico: AUTO_LOADS lotes solos → botón → clic → AUTO_LOADS más → botón…
    const isAutoLoading = batches.length - autoStart < AUTO_LOADS;

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


    // Scroll infinito: el enlace "Cargar más" se vigila y, cuando está a
    // punto de entrar en pantalla, se carga el lote siguiente solo.
    const loadMoreRef = useRef<HTMLAnchorElement>(null);

    // Siempre llama a la versión más reciente de loadMore (con la página y el
    // estado actuales), sin que el efecto tenga que depender de ella.
    const onNearEnd = useEffectEvent(() => {
        loadMore();
    });

    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element || !hasMore || !isAutoLoading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onNearEnd();
            },
            // Se dispara 600px ANTES de llegar al final: cuando el usuario
            // llega, los productos ya están cargados o a punto
            { rootMargin: "0px 0px 600px 0px" }
        );

        observer.observe(element);

        // Limpieza: antes de repetir el efecto y al desmontar
        return () => observer.disconnect();

        // currentPage: tras cada lote se vuelve a observar; así, si el enlace
        // sigue en pantalla, dispara otra vez (el observer solo avisa de cambios)
    }, [hasMore, isAutoLoading, currentPage]);

    return (
        <>
            <div className={styles.grid} aria-busy={loading}>
                {batches.map((batch) => (
                    <ProductBatch
                        key={batch.page}
                        products={batch.products}
                        pricesPromise={batch.pricesPromise}
                    />
                ))}

                {/* Mientras llega el lote siguiente: tarjetas vacías donde irá */}
                {loading && <SkeletonCards count={initialProducts.length} />}
            </div>

            {hasMore && (
                // Enlace real a la página siguiente: Google (y quien no tenga
                // JavaScript) llega a todos los productos. Con JavaScript se
                // intercepta el clic y se añaden los productos sin recargar.
                <a
                    ref={loadMoreRef}
                    href={`?${nextPageQuery}`}
                    // Mientras la carga es automática, el enlace está oculto
                    // (sigue ahí para el observer, Google y el teclado)
                    data-auto={isAutoLoading}
                    className={styles.loadMore}
                    aria-disabled={loading}
                    onClick={(event) => {
                        event.preventDefault();
                        // El lote que carga este clic cuenta como inicio de
                        // una nueva tanda automática
                        setAutoStart(batches.length + 1);
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