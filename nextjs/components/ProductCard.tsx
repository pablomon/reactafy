"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import { CartContext } from "@/app/context/CartContext";
import Price from "@/components/Price";
import { productFormat, productQuantity, productUnits } from "@/utils/productFormat";
import { productPath } from "@/utils/productPath";
import { brandPath } from "@/utils/brandPath";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
    product: Product;
    pricesPromise?: Promise<Record<number, ProductPrice>>;
    // Imagen por encima del pliegue: se pide ya y con prioridad alta.
    eagerImage?: boolean;
};

type AddState = "idle" | "adding" | "added" | "error";

// Tamaño de la imagen según las columnas de ProductGrid.
const IMAGE_SIZES =
    "(min-width: 1280px) 256px, (min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw";

export default function ProductCard({
    product,
    pricesPromise,
    eagerImage = false,
}: ProductCardProps) {
    const { addItem } = useContext(CartContext);
    const [addState, setAddState] = useState<AddState>("idle");

    const format = productFormat(product);
    const quantity = productQuantity(product);

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

    // Al abrir la ficha (o la marca) desde una tarjeta, la página nueva
    // empieza arriba. Se salta si:
    //  - otro manejador ya se encargó (defaultPrevented): el carrusel de
    //    "Te puede interesar" hace su propio scroll suave;
    //  - es Ctrl/Cmd/Shift o botón central: se abre en otra pestaña.
    function scrollToTop(event: React.MouseEvent) {
        if (
            event.defaultPrevented ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.button !== 0
        ) {
            return;
        }

        window.scrollTo({ top: 0 });
    }

    const addLabel = {
        idle: `Añadir ${product.title} al carrito`,
        adding: "Añadiendo…",
        added: "Añadido al carrito",
        error: "No se ha podido añadir. Inténtalo de nuevo",
    }[addState];

    const image = product.image && (
        <Image
            className={styles.image}
            src={product.image}
            alt=""
            width={300}
            height={300}
            sizes={IMAGE_SIZES}
            // undefined deja el comportamiento por defecto (lazy). Las
            // imágenes que se ven sin hacer scroll no pueden esperar a que el
            // navegador calcule el diseño para pedirse: es la LCP.
            loading={eagerImage ? "eager" : undefined}
            fetchPriority={eagerImage ? "high" : undefined}
        />
    );

    return (
        <article className={styles.card}>
            <div className={styles.imageBox}>
                {/* Enlace duplicado del nombre: fuera del orden de tabulación */}
                <Link
                    href={href}
                    className={styles.imageLink}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={scrollToTop}
                >
                    {image}
                </Link>

                {quantity && (
                    // Solo el número a la vista; el lector de pantalla lee
                    // "La caja contiene 24 latas"
                    <span
                        className={styles.quantity}
                        role="img"
                        aria-label={`La caja contiene ${productUnits(product)}`}
                        title={`La caja contiene ${productUnits(product)}`}
                    >
                        {quantity}
                    </span>
                )}

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
                    <Link href={href} onClick={scrollToTop}>{product.title}</Link>
                </h2>

                {format && (
                    <p className={styles.meta}>{format}</p>
                )}

                {pricesPromise && (
                    <Price
                        productId={product.id}
                        pricesPromise={pricesPromise}
                        showTax={false}
                    />
                )}

                {product.brand && (
                    <Link
                        href={brandPath(product.brand.slug)}
                        className={styles.brand}
                        onClick={scrollToTop}
                    >
                        {product.brand.name}
                    </Link>
                )}
            </div>
        </article>
    );
}
