"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import styles from "./page.module.css";

type Tab = {
    label: string;
    content: ReactNode;
};

// Pestañas (Misión / Visión / Valores). Todos los textos están en la página
// desde el principio, también los de las pestañas que no se ven: así los
// lee Google. Solo se esconden con "hidden".
export default function AboutTabs({ tabs }: { tabs: Tab[] }) {
    const [active, setActive] = useState(0);
    const id = useId();

    function select(index: number) {
        setActive(index);
        document.getElementById(`${id}-tab-${index}`)?.focus();
    }

    // Con el teclado: flechas para pasar de una pestaña a otra
    function handleKeyDown(event: KeyboardEvent, index: number) {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            select((index + 1) % tabs.length);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            select((index - 1 + tabs.length) % tabs.length);
        }
    }

    return (
        <div>
            <div role="tablist" className={styles.tabList}>
                {tabs.map((tab, index) => (
                    <button
                        key={tab.label}
                        type="button"
                        role="tab"
                        id={`${id}-tab-${index}`}
                        aria-selected={index === active}
                        aria-controls={`${id}-panel-${index}`}
                        tabIndex={index === active ? 0 : -1}
                        className={styles.tab}
                        onClick={() => setActive(index)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {tabs.map((tab, index) => (
                <div
                    key={tab.label}
                    role="tabpanel"
                    id={`${id}-panel-${index}`}
                    aria-labelledby={`${id}-tab-${index}`}
                    hidden={index !== active}
                    className={styles.tabPanel}
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}
