"use client";

import { useRouter } from "next/navigation";
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

    const router = useRouter();

    // Al pulsar una tarjeta queremos subir arriba con scroll SUAVE.
    // Si lo dejamos al <Link>, Next hace su propio scroll (instantáneo) al
    // montar la página nueva y corta la animación. Así que aquí:
    //  1. preventDefault(): el <Link> ve que el clic ya está "atendido" y
    //     no navega (lo comprueba con e.defaultPrevented).
    //  2. Navegamos nosotros con router.push(…, { scroll: false }): Next no
    //     toca el scroll.
    //  3. Subimos con scrollTo smooth mientras llega la página.
    //     Problema: el esqueleto es más bajo que la página; al montarse, el
    //     navegador recorta el scroll al nuevo máximo y CANCELA la animación.
    //     Por eso fijamos la altura mínima del documento mientras sube y la
    //     soltamos al acabar (evento scrollend, con un plan B por tiempo).
    // onClickCapture: un solo manejador en la lista (delegación de eventos)
    // que se ejecuta ANTES que el onClick del <Link>.
    function handleClickCapture(event: React.MouseEvent) {
        const link = (event.target as HTMLElement).closest("a");

        // Ctrl/Cmd/Shift o botón central → nueva pestaña: comportamiento normal
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

        const href = link.getAttribute("href");
        if (!href?.startsWith("/producto/")) return;

        event.preventDefault();

        const root = document.documentElement;
        root.style.minHeight = `${root.scrollHeight}px`;

        const release = () => {
            root.style.minHeight = "";
        };
        window.addEventListener("scrollend", release, { once: true });
        setTimeout(release, 1500);

        router.push(href, { scroll: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
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

                <ul ref={trackRef} className={styles.carouselTrack} onClickCapture={handleClickCapture}>
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
