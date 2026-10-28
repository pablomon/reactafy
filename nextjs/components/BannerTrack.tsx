"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

import styles from "./BannerCarousel.module.css";

// Cada cuántos milisegundos pasa al siguiente banner
const INTERVAL_MS = 5000;

// Cuánto hay que arrastrar con el ratón para pasar al banner siguiente
const DRAG_TO_CHANGE_PX = 60;

// Por debajo de esto no es un arrastre, es un clic
const DRAG_START_PX = 5;

type Props = {
    // Los banners ya pintados en el servidor (cada uno es un <li>)
    children: ReactNode;
    // Cuántos hay: con uno solo no hay nada que girar
    count: number;
};

export default function BannerTrack({ children, count }: Props) {
    const trackRef = useRef<HTMLUListElement>(null);

    // Ratón encima, teclado dentro o dedo tocando: no mover lo que se está usando
    const [interacting, setInteracting] = useState(false);
    // El carrusel está en pantalla (no tiene sentido girar si no se ve)
    const [visible, setVisible] = useState(true);
    // Cuál se está viendo (0 = el primero). Marca el punto activo.
    const [current, setCurrent] = useState(0);
    // Se está arrastrando con el ratón
    const [dragging, setDragging] = useState(false);

    // Datos del arrastre en curso. Es una referencia y no un estado porque
    // cambia en cada movimiento y no hace falta volver a pintar.
    const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

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

    // ---- Arrastrar con el ratón ----
    // Con el dedo no hace falta nada: el navegador ya desliza solo. El ratón
    // no sabe arrastrar una fila, así que se lo enseñamos aquí.

    function handlePointerDown(event: PointerEvent<HTMLUListElement>) {
        const track = trackRef.current;

        // Solo el botón izquierdo del ratón; el dedo y el lápiz van por su cuenta
        if (!track || event.pointerType !== "mouse" || event.button !== 0) {
            return;
        }

        drag.current = {
            active: true,
            moved: false,
            startX: event.clientX,
            startScroll: track.scrollLeft,
        };
    }

    function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
        const track = trackRef.current;
        const state = drag.current;

        if (!track || !state.active) {
            return;
        }

        const distance = event.clientX - state.startX;

        if (!state.moved) {
            if (Math.abs(distance) < DRAG_START_PX) {
                return;
            }

            // Ya es un arrastre. A partir de aquí el ratón queda "pegado" a la
            // fila aunque salga de ella, y se quita el imán mientras se arrastra:
            // si no, el imán pelearía contra la mano.
            state.moved = true;
            track.setPointerCapture(event.pointerId);
            setDragging(true);
        }

        track.scrollLeft = state.startScroll - distance;
    }

    function endDrag(event: PointerEvent<HTMLUListElement>) {
        const track = trackRef.current;
        const state = drag.current;

        if (!track || !state.active) {
            return;
        }

        state.active = false;

        if (!state.moved) {
            return;
        }

        track.releasePointerCapture(event.pointerId);
        setDragging(false);

        // Al soltar: un arrastre claro cambia de banner; uno pequeño vuelve al mismo
        const distance = event.clientX - state.startX;
        const start = Math.round(state.startScroll / track.clientWidth);

        let target = start;

        if (distance < -DRAG_TO_CHANGE_PX) {
            target = Math.min(start + 1, count - 1);
        } else if (distance > DRAG_TO_CHANGE_PX) {
            target = Math.max(start - 1, 0);
        }

        goTo(target);
    }

    // Si acabas de arrastrar, soltar el ratón no debe contar como un clic en
    // el banner (te llevaría a su enlace sin querer)
    function handleClickCapture(event: React.MouseEvent<HTMLUListElement>) {
        if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
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

        if (!track || count < 2 || interacting || !visible || reducedMotion) {
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
    }, [count, interacting, visible]);

    return (
        <>
            <ul
                ref={trackRef}
                className={`${styles.track} ${dragging ? styles.dragging : ""}`}
                onPointerEnter={() => setInteracting(true)}
                onPointerLeave={() => setInteracting(false)}
                onFocusCapture={() => setInteracting(true)}
                onBlurCapture={() => setInteracting(false)}
                onTouchStart={() => setInteracting(true)}
                onTouchEnd={() => setInteracting(false)}
                onScroll={handleScroll}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClickCapture={handleClickCapture}
                // Un enlace se puede arrastrar de forma nativa (para soltarlo en otro
                // sitio) y eso cancelaría nuestro arrastre
                onDragStart={(event) => event.preventDefault()}
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
        </>
    );
}
