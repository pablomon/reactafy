"use client";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import styles from "./ProductCard.module.css";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import Price from "@/components/Price";

interface ProductCardProps {
    product: Product;
    pricesPromise: Promise<Record<number, ProductPrice>>;
}

export default function ProductCard({
                                        product,
                                        pricesPromise,
                                    }: ProductCardProps) {
    const volume = product.attributes.find(
        (attribute) => attribute.slug === "volumen"
    );

    const quantity = product.attributes.find(
        (attribute) => attribute.slug === "cantidad"
    );

    const category =
        product.categories.find(
            (category) => category.parentId !== 0
        ) ?? product.categories[0];

    return (
        <article className={styles.card}>
            <div className={styles.imageBox}>
                {product.image ? (
                    <img
                        className={styles.image}
                        src={product.image}
                        alt={product.title}
                        width={300}
                        height={300}
                    />
                ) : (
                    <div />
                )}
            </div>

            {category && (
                <span className={styles.category}>
                    {category.name}
                </span>
            )}

            <Link href={`/producto/${product.id}`}>
                <h2 className={styles.name}>
                    {product.title}
                </h2>
            </Link>

            {quantity && volume && (
                <p className={styles.meta}>
                    {quantity.value} botellas de {volume.value}
                </p>
            )}

            <Price
                productId={product.id}
                pricesPromise={pricesPromise}
            />

            {product.brand && (
                <p className={styles.brand}>
                    {product.brand.name}
                </p>
            )}

            <AddToCartButton productId={product.id} />
        </article>
    );
}