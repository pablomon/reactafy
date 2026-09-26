import Link from "next/link";

import type { CategoryPathItem } from "@/types/category";
import type { Subcategory } from "@/types/product";
import { categoryPath } from "@/utils/categoryPath";
import styles from "./CategoryChips.module.css";

type CategoryChipsProps = {
    // Ruta de la categoría actual ([] en /tienda/): los chips cuelgan de ella
    parentPath: CategoryPathItem[];
    items: Subcategory[];
};

// Chips de subcategorías encima del grid.
// Enlaces normales: Google los sigue y cada uno es una URL indexable.
// Server Component: sin estado ni eventos.
export default function CategoryChips({ parentPath, items }: CategoryChipsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Categorías" className={styles.chips}>
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.slug}>
                        <Link
                            href={categoryPath([...parentPath, item])}
                            className={styles.chip}
                        >
                            {item.name}
                            <span className={styles.count}>{item.count}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
