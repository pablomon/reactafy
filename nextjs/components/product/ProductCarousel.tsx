"use client";

import { useEffect, useRef, useState } from "react";

import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import ProductCard from "@/components/ProductCard";
import styles from "./Product.module.css";

type ProductCarouselProps = {
    title: string;
    products: Product[];
    pricesPromise: Promise<Record<number, ProductPrice>>;
};

// Fila de tarjetas con scroll horizontal (dedo, trackpad o flechas ‹ ›).
// El desplazamiento lo hace el navegador (overflow + scroll-snap); las
// flechas solo mueven el scroll una "pantalla".
export default function ProductCarousel({ title, products, pricesPromise }: ProductCarouselProps) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    // Activa/desactiva las flechas según la posición del scroll
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        function update() {
            if (!track) return;
            setCanPrev(track.scrollLeft > 4);
            setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
        }

        update();
        track.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);

        return () => {
            track.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    function scroll(direction: 1 | -1) {
        const track = trackRef.current;
        if (!track) return;

        track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className={styles.carousel} aria-label={title}>
            <h2 className={styles.carouselTitle}>{title}</h2>

            <div className={styles.carouselBody}>
                <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselPrev}`}
                    onClick={() => scroll(-1)}
                    disabled={!canPrev}
                    aria-label="Anteriores"
                >
                    ‹
                </button>

                <ul ref={trackRef} className={styles.carouselTrack}>
                    {products.map((product) => (
                        <li key={product.id} className={styles.carouselItem}>
                            <ProductCard product={product} pricesPromise={pricesPromise} />
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselNext}`}
                    onClick={() => scroll(1)}
                    disabled={!canNext}
                    aria-label="Siguientes"
                >
                    ›
                </button>
            </div>
        </section>
    );
}
