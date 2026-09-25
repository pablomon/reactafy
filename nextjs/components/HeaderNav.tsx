"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Header.module.css";
import type { HeaderMenuItem } from "./MobileMenu";

type HeaderNavProps = {
    items: HeaderMenuItem[];
};

// Cliente porque necesita la ruta actual: en la página del propio
// enlace, "Tienda" pierde la pastilla (como en aguafy.com).
export default function HeaderNav(props: HeaderNavProps) {
    const pathname = usePathname();

    return (
        <ul className={styles.navList}>
            {props.items.map((item) => {
                const isCurrent =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                const className =
                    item.highlight && !isCurrent
                        ? styles.navHighlight
                        : styles.navLink;

                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={className}
                            aria-current={isCurrent ? "page" : undefined}
                        >
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
