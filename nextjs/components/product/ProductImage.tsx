"use client";

import Image from "next/image";

type ProductImageProps = {
    src: string;
    alt: string;
    className?: string;
};

// La última foto que se quitó de pantalla: su URL (ya en caché del
// navegador), su opacidad en ese instante y cuándo. Vive fuera del
// componente porque al cambiar de producto Next monta la página de
// nuevo: el <img> viejo se desmonta y llega uno nuevo, sin estado común.
let previous: { src: string; opacity: string; at: number } | null = null;

// Si la foto vieja se quitó hace más de esto, no es un cambio de
// volumen (es otra navegación): no se reutiliza.
const HANDOFF_MS = 100;

// Imagen de la ficha con relevo suave al cambiar de volumen:
//
// 1. Mientras llega el producto nuevo, el CSS atenúa la foto actual
//    (ver .image en ProductPage.module.css).
// 2. Al llegar, el <img> nuevo arranca con la MISMA opacidad que tenía el
//    viejo y, si su foto aún no ha bajado, muestra la vieja de fondo.
//    Así no hay hueco en blanco (ese era el parpadeo).
// 3. Cuando la foto nueva está lista, se quita el fondo y se suelta la
//    opacidad: la transición del CSS la lleva a 1 (el fundido).
//
// En la primera carga (o viniendo de otra página) no hay relevo: la
// imagen sale tal cual, sin esperar a React.
export default function ProductImage({ src, alt, className }: ProductImageProps) {
    return (
        <Image
            ref={(img) => {
                if (!img) return;

                const handoff =
                    previous && performance.now() - previous.at < HANDOFF_MS
                        ? previous
                        : null;

                if (handoff) {
                    img.style.opacity = handoff.opacity;

                    if (!img.complete) {
                        img.style.backgroundImage = `url("${handoff.src}")`;
                    }
                }

                // Foto nueva lista: fuera el fondo y a opacidad normal.
                // Leer la opacidad obliga al navegador a "fijar" la de
                // partida antes de quitarla; si no, no habría transición.
                const reveal = () => {
                    img.style.backgroundImage = "";
                    void getComputedStyle(img).opacity;
                    img.style.opacity = "";
                };

                if (img.complete) {
                    if (handoff) reveal();
                } else {
                    img.addEventListener("load", reveal, { once: true });
                    img.addEventListener("error", reveal, { once: true });
                }

                // React 19: se ejecuta al desmontar. Guardamos la foto y su
                // opacidad actual (a mitad de transición, si la hay) para el
                // <img> que viene detrás.
                return () => {
                    img.removeEventListener("load", reveal);
                    img.removeEventListener("error", reveal);

                    previous = {
                        src: img.currentSrc,
                        opacity: getComputedStyle(img).opacity,
                        at: performance.now(),
                    };
                };
            }}
            className={className}
            src={src}
            alt={alt}
            width={600}
            height={600}
            sizes="(min-width: 992px) 40vw, 100vw"
            priority
        />
    );
}
