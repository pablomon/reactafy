// Cómo es una URL filtrada de la tienda. Único sitio que lo sabe;
// lo usan el servidor (página, ActiveFilters) y el cliente (ShopFilters).
//
//   /tienda/bebidas/?brand=perrier,tehuacan&envase=vidrio&orderby=price
//
// Cada faceta es un parámetro con el mismo nombre que en la API de
// WordPress (brand, envase, volumen…) y sus opciones separadas por comas.
// Así no hay ninguna lista de facetas en Next: se pasan tal cual.

// searchParams tal como los da Next a una página
export type SearchParams = Record<string, string | string[] | undefined>;

// searchParams de Next → URLSearchParams.
// Un parámetro repetido (?envase=lata&envase=pet) se une con comas.
export function toQuery(searchParams: SearchParams): URLSearchParams {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined) continue;

        const joined = Array.isArray(value) ? value.join(",") : value;

        if (joined !== "") {
            query.set(key, joined);
        }
    }

    return query;
}

// Opciones marcadas de una faceta: "lata,vidrio" → ["lata", "vidrio"]
export function selectedValues(query: URLSearchParams, facet: string): string[] {
    return (query.get(facet) ?? "").split(",").filter(Boolean);
}

// Marca o desmarca una opción. Devuelve una query NUEVA (no modifica la
// recibida) y sin `page`: al cambiar los filtros se vuelve a la página 1.
export function toggleFilter(
    query: URLSearchParams,
    facet: string,
    value: string
): URLSearchParams {
    const next = new URLSearchParams(query);
    const selected = selectedValues(query, facet);

    const updated = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

    if (updated.length > 0) {
        next.set(facet, updated.join(","));
    } else {
        next.delete(facet);
    }

    next.delete("page");

    return next;
}

// Cambia (o quita, con "") un parámetro suelto, como el orden.
export function setParam(
    query: URLSearchParams,
    key: string,
    value: string
): URLSearchParams {
    const next = new URLSearchParams(query);

    if (value) {
        next.set(key, value);
    } else {
        next.delete(key);
    }

    next.delete("page");

    return next;
}

// Quita todas las facetas (se mantienen el orden y los utm_…).
export function clearFilters(
    query: URLSearchParams,
    facets: string[]
): URLSearchParams {
    const next = new URLSearchParams(query);

    for (const facet of facets) {
        next.delete(facet);
    }

    next.delete("page");

    return next;
}

// Ruta + query: ("/tienda/", "envase=lata") → "/tienda/?envase=lata"
// URLSearchParams escribe las comas como %2C; se dejan como "," para que
// la URL sea legible (?envase=lata,vidrio). Ambas formas son válidas.
export function withQuery(path: string, query: URLSearchParams): string {
    const search = query.toString().replaceAll("%2C", ",");

    return search ? `${path}?${search}` : path;
}
