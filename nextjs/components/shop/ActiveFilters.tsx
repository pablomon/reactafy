import Link from "next/link";

import type { Facet } from "@/types/product";
import {
    clearFilters,
    selectedValues,
    toggleFilter,
    withQuery,
} from "@/utils/filterUrl";
import styles from "./Shop.module.css";

type ActiveFiltersProps = {
    facets: Facet[];
    // Ruta de la categoría sin filtros: "/tienda/bebidas/"
    basePath: string;
    // Query actual sin page: "brand=perrier&envase=vidrio"
    queryString: string;
};

// Filtros activos como chips con ×. Cada × es un ENLACE a la misma URL
// sin ese filtro: funciona sin JavaScript y es un Server Component.
export default function ActiveFilters({
    facets,
    basePath,
    queryString,
}: ActiveFiltersProps) {
    const query = new URLSearchParams(queryString);

    // [{ facet: "envase", slug: "vidrio", name: "Vidrio" }, …]
    const active = facets.flatMap((facet) =>
        selectedValues(query, facet.slug).map((slug) => ({
            facet: facet.slug,
            slug,
            name:
                facet.options.find((option) => option.slug === slug)?.name ??
                slug,
        }))
    );

    if (active.length === 0) {
        return null;
    }

    return (
        <ul className={styles.activeList} aria-label="Filtros activos">
            {active.map((item) => (
                <li key={`${item.facet}:${item.slug}`}>
                    <Link
                        href={withQuery(
                            basePath,
                            toggleFilter(query, item.facet, item.slug)
                        )}
                        scroll={false}
                        className={styles.activeChip}
                        aria-label={`Quitar filtro ${item.name}`}
                    >
                        {item.name}
                        <span aria-hidden="true">×</span>
                    </Link>
                </li>
            ))}

            <li>
                <Link
                    href={withQuery(
                        basePath,
                        clearFilters(query, facets.map((facet) => facet.slug))
                    )}
                    scroll={false}
                    className={styles.clearLink}
                >
                    Limpiar filtros
                </Link>
            </li>
        </ul>
    );
}
