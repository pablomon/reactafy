"use client";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import ProductCard from "@/components/ProductCard";

type ProductBatchProps = {
    products: Product[];
    pricesPromise: Promise<Record<number, ProductPrice>>;
    // Cuántas de las primeras tarjetas cargan su imagen con prioridad.
    eagerImages?: number;
};

export default function ProductBatch({
                                         products,
                                         pricesPromise,
                                         eagerImages = 0,
                                     }: ProductBatchProps) {
    return (
        <>
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    pricesPromise={pricesPromise}
                    eagerImage={index < eagerImages}
                />
            ))}
        </>
    );
}