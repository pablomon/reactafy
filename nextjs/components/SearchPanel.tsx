"use client";

import Image from "next/image";
import Link from "next/link";
import {
    useEffect,
    useId,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import type { BrandSummary } from "@/types/brand";
import { brandPath } from "@/utils/brandPath";
import CloseButton from "./CloseButton";
import styles from "./SearchPanel.module.css";

type SearchPanelProps = {
    brands: BrandSummary[];
    // Aspecto del botón que lo abre (lo decide el header: icono o "Buscar")
    triggerClassName: string;
    triggerLabel?: string;
    children: ReactNode;
};

// Botón "Buscar" + panel que baja desde arriba con las marcas.
//
// El panel se dibuja con createPortal directamente en <body>, fuera del
// header: si la zona del header donde está el botón se oculta (al cruzar
// el salto móvil/escritorio), el panel no se oculta con ella.
//
// El panel está SIEMPRE en el DOM (no {open && …}) para que la
// transición de entrada y salida funcione: se mueve con CSS según
// data-open. Cerrado lleva `inert`: no se puede tabular dentro ni lo
// leen los lectores de pantalla. Los enlaces siguen en el HTML, así
// que Google ve las páginas de marca desde cualquier página.
export default function SearchPanel({
    brands,
    triggerClassName,
    triggerLabel,
    children,
}: SearchPanelProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const closeRef = useRef<HTMLButtonElement>(null);

    // Abierto: foco en la X, Escape cierra y la página no hace scroll.
    useEffect(() => {
        if (!open) return;

        closeRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    const close = () => setOpen(false);

    // ¿Estamos en el navegador? En el servidor no existe document.body,
    // así que ahí (y en la hidratación) el panel se pinta en su sitio, y
    // sus enlaces siguen saliendo en el HTML. Ya en el cliente, se mueve
    // a <body>. useSyncExternalStore da false en el servidor y true en el
    // cliente sin el setState-en-useEffect de siempre.
    const isClient = useSyncExternalStore(
        subscribeNothing,
        () => true,
        () => false
    );

    const overlay = (
        <>
            <div
                className={styles.backdrop}
                data-open={open}
                onClick={close}
                aria-hidden="true"
            />

            <div
                id={panelId}
                className={styles.panel}
                data-open={open}
                role="dialog"
                aria-modal="true"
                aria-label="Marcas"
                inert={!open}
            >
                <div className={styles.inner}>
                    <CloseButton
                        ref={closeRef}
                        className={styles.close}
                        aria-label="Cerrar las marcas"
                        onClick={close}
                    />

                    <ul className={styles.grid}>
                        {brands.map((brand) => (
                            <li key={brand.id}>
                                <Link
                                    href={brandPath(brand.slug)}
                                    className={styles.brand}
                                    onClick={close}
                                >
                                    {brand.image ? (
                                        <Image
                                            src={brand.image}
                                            alt=""
                                            width={84}
                                            height={84}
                                            className={styles.logo}
                                        />
                                    ) : (
                                        <span className={styles.logo} />
                                    )}

                                    <span className={styles.name}>{brand.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );

    return (
        <>
            <button
                type="button"
                className={triggerClassName}
                aria-label={triggerLabel}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(true)}
            >
                {children}
            </button>

            {isClient ? createPortal(overlay, document.body) : overlay}
        </>
    );
}

// No hay nada a lo que suscribirse: solo queremos saber si es el cliente.
function subscribeNothing() {
    return () => {};
}
