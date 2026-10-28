"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";

import styles from "./Tabs.module.css";

type Tab = {
    // Si lo tiene, la pestaña se puede abrir con la dirección /pagina/#id
    id?: string;
    label: string;
    content: ReactNode;
};

// Pestañas. Todos los textos están en la página
// desde el principio, también los de las pestañas que no se ven: así los
// lee Google. Solo se esconden con "hidden".
export default function Tabs({ tabs }: { tabs: Tab[] }) {
    const [active, setActive] = useState(0);
    const id = useId();

    // Con la dirección /faq/#politica-de-privacidad se abre esa pestaña. Se
    // mira al cargar la página y cada vez que cambia el #, por ejemplo al
    // pulsar un enlace del pie estando ya en la página.
    useEffect(() => {
        function openFromAddress() {
            const index = tabs.findIndex((tab) => tab.id === window.location.hash.slice(1));

            if (index >= 0) {
                setActive(index);
            }
        }

        openFromAddress();
        window.addEventListener("hashchange", openFromAddress);

        return () => window.removeEventListener("hashchange", openFromAddress);
    }, [tabs]);

    // Abrir una pestaña a mano también la deja en la dirección, para poder
    // copiarla y compartirla. replaceState no añade pasos al historial.
    function open(index: number) {
        setActive(index);

        const tabId = tabs[index].id;

        if (tabId) {
            window.history.replaceState(null, "", `#${tabId}`);
        }
    }

    function select(index: number) {
        open(index);
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
                        onClick={() => open(index)}
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
