"use client";

import { useId, useRef, useState } from "react";

import type { ProductAttribute } from "@/types/product";
import styles from "./Product.module.css";

type ProductTabsProps = {
    attributes: ProductAttribute[];
    // HTML ya limpio en WordPress (wp_kses_post)
    descriptionHtml: string;
    brand: { name: string; descriptionHtml: string } | null;
};

type Tab = { id: string; label: string };

// "Características" / "Sobre la marca". Pestañas accesibles (patrón
// WAI-ARIA "tabs"): role=tablist/tab/tabpanel y flechas del teclado.
export default function ProductTabs({ attributes, descriptionHtml, brand }: ProductTabsProps) {
    // Prefijo único para los id (tab ↔ panel) aunque haya varias en la página
    const baseId = useId();

    const tabs: Tab[] = [
        { id: "features", label: "Características" },
        // "Sobre la marca" solo si la marca tiene descripción en Woo
        ...(brand?.descriptionHtml ? [{ id: "brand", label: "Sobre la marca" }] : []),
    ];

    const [active, setActive] = useState(tabs[0].id);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Flechas izquierda/derecha: mueven la pestaña activa y el foco
    function handleKeyDown(event: React.KeyboardEvent, index: number) {
        const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (delta === 0) return;

        event.preventDefault();
        const next = (index + delta + tabs.length) % tabs.length;
        setActive(tabs[next].id);
        tabRefs.current[next]?.focus();
    }

    return (
        <section className={styles.tabs}>
            <div role="tablist" aria-label="Información del producto" className={styles.tabList}>
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        ref={(element) => {
                            tabRefs.current[index] = element;
                        }}
                        type="button"
                        role="tab"
                        id={`${baseId}-tab-${tab.id}`}
                        aria-selected={active === tab.id}
                        aria-controls={`${baseId}-panel-${tab.id}`}
                        // Solo la activa entra en el orden de Tab; las demás, con flechas
                        tabIndex={active === tab.id ? 0 : -1}
                        className={styles.tab}
                        onClick={() => setActive(tab.id)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div
                role="tabpanel"
                id={`${baseId}-panel-features`}
                aria-labelledby={`${baseId}-tab-features`}
                hidden={active !== "features"}
                className={styles.tabPanel}
            >
                <div className={styles.features}>
                    <dl className={styles.featureList}>
                        {attributes.map((attribute) => (
                            <div key={attribute.slug} className={styles.featureRow}>
                                <dt>{attribute.name}:</dt>
                                <dd>{attribute.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {descriptionHtml && (
                        <div
                            className={styles.richText}
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        />
                    )}
                </div>
            </div>

            {brand?.descriptionHtml && (
                <div
                    role="tabpanel"
                    id={`${baseId}-panel-brand`}
                    aria-labelledby={`${baseId}-tab-brand`}
                    hidden={active !== "brand"}
                    className={styles.tabPanel}
                >
                    <div
                        className={styles.richText}
                        dangerouslySetInnerHTML={{ __html: brand.descriptionHtml }}
                    />
                </div>
            )}
        </section>
    );
}
