"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./BannerCarousel.module.css";

// Cada cuántos milisegundos pasa al siguiente banner
const INTERVAL_MS = 5000;

type Props = {
    // Los banners ya pintados en el servidor (cada uno es un <li>)
    children: ReactNode;
    // Cuántos hay: con uno solo no hay nada que girar
    count: number;
};

export default function BannerTrack({ children, count }: Props) {
    const trackRef = useRef<HTMLUListElement>(null);

    // La persona pulsó "Pausar"
    const [paused, setPaused] = useState(false);
    // Ratón encima, teclado dentro o dedo tocando: no mover lo que se está usando
    const [interacting, setInteracting] = useState(false);
    // El carrusel está en pantalla (no tiene sentido girar si no se ve)
    const [visible, setVisible] = useState(true);
    // Cuál se está viendo (0 = el primero). Marca el punto activo.
    const [current, setCurrent] = useState(0);

    // Desliza la fila hasta el banner número "index"
    function goTo(index: number) {
        const track = trackRef.current;

        if (track) {
            track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
        }
    }

    // Se llama mientras la fila se desliza (con el dedo, el ratón o solo)
    function handleScroll() {
        const track = trackRef.current;

        if (track) {
            setCurrent(Math.round(track.scrollLeft / track.clientWidth));
        }
    }

    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
        });

        observer.observe(track);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const track = trackRef.current;

        // Quien tiene activado "reducir movimiento" en su sistema no quiere
        // cosas que se muevan solas.
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (!track || count < 2 || paused || interacting || !visible || reducedMotion) {
            return;
        }

        const timer = setInterval(() => {
            // Mira cuál se está viendo y pasa al siguiente (el último vuelve al primero)
            const shown = Math.round(track.scrollLeft / track.clientWidth);
            const next = (shown + 1) % count;

            track.scrollTo({
                left: next * track.clientWidth,
                behavior: "smooth",
            });
        }, INTERVAL_MS);

        // Al cambiar cualquier cosa de arriba, se para este temporizador
        return () => clearInterval(timer);
    }, [count, paused, interacting, visible]);

    return (
        <>
            <ul
                ref={trackRef}
                className={styles.track}
                onPointerEnter={() => setInteracting(true)}
                onPointerLeave={() => setInteracting(false)}
                onFocusCapture={() => setInteracting(true)}
                onBlurCapture={() => setInteracting(false)}
                onTouchStart={() => setInteracting(true)}
                onTouchEnd={() => setInteracting(false)}
                onScroll={handleScroll}
            >
                {children}
            </ul>

            {count > 1 && (
                <div className={styles.dots}>
                    {Array.from({ length: count }, (_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={styles.dot}
                            aria-label={`Ir al banner ${index + 1}`}
                            aria-current={index === current ? "true" : undefined}
                            onClick={() => goTo(index)}
                        />
                    ))}
                </div>
            )}

            {count > 1 && (
                <button
                    type="button"
                    className={styles.pause}
                    aria-pressed={paused}
                    onClick={() => setPaused((value) => !value)}
                >
                    {paused ? "Reanudar" : "Pausar"}
                </button>
            )}
        </>
    );
}
