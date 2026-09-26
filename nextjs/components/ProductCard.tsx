"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import { CartContext } from "@/app/context/CartContext";
import Price from "@/components/Price";
import { productFormat } from "@/utils/productFormat";
import { productPath } from "@/utils/productPath";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
    product: Product;
    pricesPromise?: Promise<Record<number, ProductPrice>>;
};

type AddState = "idle" | "adding" | "added" | "error";

// Tamaño de la imagen según las columnas de ProductGrid.
const IMAGE_SIZES =
    "(min-width: 1280px) 256px, (min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw";

export default function ProductCard({
    product,
    pricesPromise,
}: ProductCardProps) {
    const { addItem } = useContext(CartContext);
    const [addState, setAddState] = useState<AddState>("idle");

    const format = productFormat(product);

    const category =
        product.categories.find(
            (category) => category.parentId !== 0
        ) ?? product.categories[0];

    const href = productPath(product);

    async function handleAdd() {
        if (addState === "adding") return;

        setAddState("adding");

        try {
            await addItem(product.id, 1);
            setAddState("added");
        } catch {
            setAddState("error");
        }

        // El icono vuelve a "+" tras un momento.
        setTimeout(() => setAddState("idle"), 1500);
    }

    const addLabel = {
        idle: `Añadir ${product.title} al carrito`,
        adding: "Añadiendo…",
        added: "Añadido al carrito",
        error: "No se ha podido añadir. Inténtalo de nuevo",
    }[addState];

    return (
        <article className={styles.card}>
            <div className={styles.imageBox}>
                {/* Enlace duplicado del nombre: fuera del orden de tabulación */}
                <Link href={href} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
                    {product.image && (
                        <Image
                            className={styles.image}
                            src={product.image}
                            alt=""
                            width={300}
                            height={300}
                            sizes={IMAGE_SIZES}
                        />
                    )}
                </Link>

                <button
                    type="button"
                    className={styles.addButton}
                    data-state={addState}
                    onClick={handleAdd}
                    disabled={addState === "adding"}
                    aria-label={addLabel}
                    title={addLabel}
                >
                    {addState === "added" ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M2 8.5 6 12.5 14 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </div>

            <div className={styles.info}>
                {category && (
                    <span className={styles.category}>
                        {category.name}
                    </span>
                )}

                <h2 className={styles.name}>
                    <Link href={href}>{product.title}</Link>
                </h2>

                {format && (
                    <p className={styles.meta}>{format}</p>
                )}

                {pricesPromise && (
                    <Price
                        productId={product.id}
                        pricesPromise={pricesPromise}
                    />
                )}

                {product.brand && (
                    <Link
                        href={`/brand/${product.brand.slug}`}
                        className={styles.brand}
                    >
                        {product.brand.name}
                    </Link>
                )}
            </div>
        </article>
    );
}
