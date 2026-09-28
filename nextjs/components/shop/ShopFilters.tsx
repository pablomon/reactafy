"use client";

import CloseButton from "@/components/CloseButton";

import {
    useEffect,
    useOptimistic,
    useRef,
    useState,
    useTransition,
} from "react";
import { useRouter } from "next/navigation";

import type { Facet } from "@/types/product";
import {
    clearFilters,
    selectedValues,
    setParam,
    toggleFilter,
    withQuery,
} from "@/utils/filterUrl";
import styles from "./Shop.module.css";

// Los valores son los que acepta el endpoint /products (orderby)
const SORT_OPTIONS = [
    { value: "", label: "Destacados" },
    { value: "price", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
];

type ShopFiltersProps = {
    facets: Facet[];
    // Ruta de la categoría sin filtros: "/tienda/bebidas/"
    basePath: string;
    // Query actual sin page: "brand=perrier&envase=vidrio"
    queryString: string;
    // Productos que cumplen los filtros actuales
    total: number;
};

// Barra de la tienda (botón Filtros + orden) y panel de filtros.
//
// El estado de los filtros vive en la URL, no en useState: marcar una
// casilla cambia la URL con router.replace, Next vuelve a pintar la
// página en el servidor y llegan productos, facetas y conteos nuevos.
export default function ShopFilters({
    facets,
    basePath,
    queryString,
    total,
}: ShopFiltersProps) {
    const router = useRouter();

    // isPending: true mientras Next trae la página filtrada del servidor
    const [isPending, startTransition] = useTransition();

    // La casilla se marca AL INSTANTE, sin esperar al servidor. Cuando
    // llega la respuesta, queryString (la de verdad) sustituye a esta.
    const [optimisticQuery, setOptimisticQuery] = useOptimistic(queryString);

    const [isOpen, setIsOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    const query = new URLSearchParams(optimisticQuery);
    const facetSlugs = facets.map((facet) => facet.slug);

    const activeCount = facets.reduce(
        (sum, facet) => sum + selectedValues(query, facet.slug).length,
        0
    );

    function navigate(next: URLSearchParams) {
        startTransition(() => {
            setOptimisticQuery(next.toString());
            // replace: filtrar no llena el historial ("atrás" sale de la tienda)
            // scroll: false: la página no salta arriba al filtrar
            router.replace(withQuery(basePath, next), { scroll: false });
        });
    }

    // Abierto: foco en la X, Escape cierra y la página no hace scroll.
    // Al cerrar, el foco vuelve al botón "Filtros".
    useEffect(() => {
        if (!isOpen) return;

        const previousFocus = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
            previousFocus?.focus();
        };
    }, [isOpen]);

    return (
        <>
            <div className={styles.toolbar}>
                {facets.length > 0 && (
                    <button
                        type="button"
                        className={styles.filterButton}
                        aria-haspopup="dialog"
                        onClick={() => setIsOpen(true)}
                    >
                        Filtros
                        {activeCount > 0 && (
                            <span className={styles.filterBadge}>
                                {activeCount}
                            </span>
                        )}
                    </button>
                )}

                {isPending && (
                    <span className={styles.pending} role="status">
                        Actualizando…
                    </span>
                )}

                <label className={styles.sort}>
                    <span className={styles.sortLabel}>Ordenar</span>
                    <select
                        className={styles.sortSelect}
                        value={query.get("orderby") ?? ""}
                        onChange={(event) =>
                            navigate(setParam(query, "orderby", event.target.value))
                        }
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Siempre montado, como la cesta: así el CSS anima entrada y salida */}
            <div
                className={styles.overlay}
                data-open={isOpen}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={styles.drawer}
                data-open={isOpen}
                aria-hidden={!isOpen}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filters-drawer-title"
            >
                <header className={styles.drawerHeader}>
                    <h2 id="filters-drawer-title" className={styles.drawerTitle}>
                        Filtros
                    </h2>

                    <CloseButton
                        ref={closeRef}
                        aria-label="Cerrar los filtros"
                        onClick={() => setIsOpen(false)}
                    />
                </header>

                <div className={styles.drawerBody}>
                    {facets.map((facet) => {
                        const selected = selectedValues(query, facet.slug);

                        return (
                            <fieldset key={facet.slug} className={styles.facet}>
                                <legend className={styles.facetTitle}>
                                    {facet.name}
                                    {selected.length > 0 && (
                                        <span
                                            className={styles.facetCount}
                                            aria-label={`${selected.length} seleccionados`}
                                        >
                                            {selected.length}
                                        </span>
                                    )}
                                </legend>

                                {/* Chips: cada uno es un <label> con su casilla dentro.
                                    La casilla es invisible, pero sigue funcionando con
                                    clic, teclado y lectores de pantalla. */}
                                <ul className={styles.chipList}>
                                    {facet.options.map((option) => {
                                        const checked = selected.includes(option.slug);
                                        // 0 productos: no se puede marcar (sí desmarcar)
                                        const disabled = !checked && option.count === 0;

                                        return (
                                            <li key={option.slug}>
                                                <label
                                                    className={styles.chip}
                                                    data-checked={checked}
                                                    data-disabled={disabled}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className={styles.chipInput}
                                                        checked={checked}
                                                        disabled={disabled}
                                                        onChange={() =>
                                                            navigate(
                                                                toggleFilter(
                                                                    query,
                                                                    facet.slug,
                                                                    option.slug
                                                                )
                                                            )
                                                        }
                                                    />
                                                    {option.name}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>

                            </fieldset>
                        );
                    })}
                </div>

                <footer className={styles.drawerFooter}>
                    {activeCount > 0 && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => navigate(clearFilters(query, facetSlugs))}
                        >
                            Limpiar
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.applyButton}
                        onClick={() => setIsOpen(false)}
                    >
                        {isPending
                            ? "Actualizando…"
                            : `Ver ${total} ${total === 1 ? "producto" : "productos"}`}
                    </button>
                </footer>
            </aside>
        </>
    );
}
