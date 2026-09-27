import type { GroupProduct, ProductAttribute } from "@/types/product";

// Selectores de la ficha: "Elige tu volumen: [330 ml] [500 ml]".
//
// Función pura (datos → datos): decide QUÉ selectores hay y a DÓNDE
// lleva cada opción. El componente solo los pinta.

export type SelectorOptionState =
    | "active"      // el producto actual
    | "available"   // misma combinación, cambiando solo este atributo
    | "other"       // no existe esa combinación: cambia también otro atributo
    | "out";        // el producto al que lleva no tiene stock

export type SelectorOption = {
    value: string;
    // Slug del producto al que lleva (dentro del mismo grupo)
    productSlug: string;
    state: SelectorOptionState;
};

export type Selector = {
    slug: string;   // "volumen"
    name: string;   // "Volumen"
    options: SelectorOption[];
};

// Atributos que NO se muestran como selector en la ficha, aunque cambien
// dentro del grupo. "cantidad" va siempre ligada al volumen (12 × 1 L,
// 24 × 600 ml…), así que elegir el volumen ya lleva al producto correcto.
const HIDDEN_SELECTORS = new Set(["cantidad"]);

function valueOf(attributes: ProductAttribute[], slug: string) {
    const value = attributes.find((attribute) => attribute.slug === slug)?.value;
    return value === undefined ? undefined : String(value);
}

export function productSelectors(
    current: { attributes: ProductAttribute[] },
    groupProducts: GroupProduct[]
): Selector[] {
    const selectors: Selector[] = [];

    for (const attribute of current.attributes) {
        if (HIDDEN_SELECTORS.has(attribute.slug)) continue;

        const currentValue = String(attribute.value);

        // Valores distintos de este atributo en el grupo, en orden de aparición
        const values = [
            ...new Set(
                groupProducts
                    .map((item) => valueOf(item.attributes, attribute.slug))
                    .filter((value): value is string => value !== undefined)
            ),
        ];

        // Solo los atributos que cambian dentro del grupo
        if (values.length < 2) continue;

        const options = values.map((value): SelectorOption => {
            const withValue = groupProducts.filter(
                (item) => valueOf(item.attributes, attribute.slug) === value
            );

            // Mismo valor en todos los demás atributos que el producto actual
            // (los ocultos no cuentan: no se eligen, se derivan)
            const exact = withValue.find((item) =>
                current.attributes.every(
                    (other) =>
                        other.slug === attribute.slug ||
                        HIDDEN_SELECTORS.has(other.slug) ||
                        valueOf(item.attributes, other.slug) === String(other.value)
                )
            );

            const target = exact ?? withValue[0];

            let state: SelectorOptionState;

            if (value === currentValue) state = "active";
            else if (target.stock.status === "out_of_stock") state = "out";
            else if (exact) state = "available";
            else state = "other";

            return { value, productSlug: target.slug, state };
        });

        selectors.push({ slug: attribute.slug, name: attribute.name, options });
    }

    return selectors;
}
