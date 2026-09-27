import Link from "next/link";

import type { ProductGroup } from "@/types/product";
import type { Selector } from "@/utils/productSelectors";
import { productPath } from "@/utils/productPath";
import OptionPending from "./OptionPending";
import styles from "./Product.module.css";

type ProductSelectorsProps = {
    selectors: Selector[];
    group: ProductGroup;
};

// "Elige tu volumen: [330 ml] [500 ml]".
// Cada opción es un ENLACE al otro producto del grupo: tiene su propia
// URL (Google la sigue, se puede abrir en otra pestaña). Server Component.
export default function ProductSelectors({ selectors, group }: ProductSelectorsProps) {
    if (selectors.length === 0) {
        return null;
    }

    return (
        <div className={styles.selectors}>
            {selectors.map((selector) => (
                <div key={selector.slug} className={styles.selector}>
                    <p className={styles.selectorLabel}>
                        Elige tu {selector.name.toLowerCase()}:
                    </p>

                    <ul className={styles.selectorOptions}>
                        {selector.options.map((option) => (
                            <li key={option.value}>
                                <Link
                                    href={productPath({ group, slug: option.productSlug })}
                                    className={styles.selectorOption}
                                    data-state={option.state}
                                    aria-current={option.state === "active" ? "true" : undefined}
                                    scroll={false}
                                    title={
                                        option.state === "out"
                                            ? "Sin stock"
                                            : option.state === "other"
                                                ? "Cambia también otras opciones"
                                                : undefined
                                    }
                                >
                                    {option.value}
                                    <OptionPending />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
