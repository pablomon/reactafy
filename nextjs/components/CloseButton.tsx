import type { ComponentProps } from "react";

import styles from "./CloseButton.module.css";

type CloseButtonProps = Omit<ComponentProps<"button">, "children" | "type"> & {
    // Obligatorio: cada panel dice qué cierra ("Cerrar la cesta"…)
    "aria-label": string;
};

// La X de todos los paneles (menú, filtros, cesta, marcas): círculo
// relleno con la X recortada, como en aguafy.com. Cambiar el tamaño o
// el color de las X = tocar solo este componente.
//
// Acepta cualquier prop de <button> (onClick, ref para el foco…) y un
// className extra para colocarlo en cada panel. En React 19 `ref` es
// una prop normal: no hace falta forwardRef.
export default function CloseButton({ className, ...props }: CloseButtonProps) {
    return (
        <button
            type="button"
            className={className ? `${styles.close} ${className}` : styles.close}
            {...props}
        >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="currentColor" />
                <path
                    d="M8.5 8.5l7 7M15.5 8.5l-7 7"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </button>
    );
}
