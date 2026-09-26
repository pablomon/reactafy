import type { Product } from "@/types/product";
import type { CartLine } from "@/types/cart";

// "24 latas de 500 ml" a partir de los atributos del producto.
//
// Versión inicial: sustituye a la función PHP que generaba este texto
// en aguafy.com. Se mejorará cuando revisemos sus reglas.

type FormatParts = {
    quantity?: string | number | null;   // atributo "cantidad": 24
    container?: string | null;           // atributo "envase": "Lata", "Vidrio"…
    volume?: string | null;              // atributo "volumen": "500 ml"
};

// Palabra que describe cada envase, en singular y plural. Lo que no
// aparece aquí se muestra como "unidad/unidades", así que un envase
// nuevo nunca rompe el texto.
type Noun = { one: string; many: string };

const CONTAINER_NOUN: Record<string, Noun> = {
    lata: { one: "lata", many: "latas" },
    vidrio: { one: "botella", many: "botellas" },
    pet: { one: "botella", many: "botellas" },
    "tetra-pak": { one: "tetra pak", many: "tetra paks" },
};

const DEFAULT_NOUN: Noun = { one: "unidad", many: "unidades" };

// "Tetra pak" → "tetra-pak", "Vídrio" → "vidrio"
function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function pluralize(noun: Noun, count: number) {
    return count === 1 ? noun.one : noun.many;
}

export function formatParts(parts: FormatParts): string {
    const count = Number(parts.quantity);
    const hasCount = Number.isFinite(count) && count > 0;
    const volume = parts.volume ? String(parts.volume) : "";

    const noun =
        (parts.container && CONTAINER_NOUN[normalize(parts.container)]) ||
        DEFAULT_NOUN;

    if (hasCount && volume) {
        return `${count} ${pluralize(noun, count)} de ${volume}`;
    }

    if (hasCount) {
        return `${count} ${pluralize(noun, count)}`;
    }

    return volume;
}

// Productos de la API de Reactafy (tienda, ficha).
export function productFormat(product: Product): string {
    const get = (slug: string) =>
        product.attributes.find((attribute) => attribute.slug === slug)?.value;

    return formatParts({
        quantity: get("cantidad"),
        container: get("envase") as string | undefined,
        volume: get("volumen") as string | undefined,
    });
}

// Líneas del carrito (Store API de Woo: los atributos llegan como
// "attribute_pa_cantidad" / "pa_cantidad").
export function cartLineFormat(line: CartLine): string {
    const get = (slug: string) =>
        line.variation.find((v) => v.raw_attribute.endsWith(slug))?.value;

    return formatParts({
        quantity: get("cantidad"),
        container: get("envase"),
        volume: get("volumen"),
    });
}
