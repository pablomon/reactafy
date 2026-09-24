"use client";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import ProductCard from "@/components/ProductCard";

interface ProductBatchProps {
    products: Product[];
    pricesPromise: Promise<Record<number, ProductPrice>>;
}

export default function ProductBatch({
                                         products,
                                         pricesPromise,
                                     }: ProductBatchProps) {
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