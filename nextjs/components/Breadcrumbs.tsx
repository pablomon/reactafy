import Link from "next/link";

import { siteConfig } from "@/config/site";
import { serializeJsonLd } from "@/utils/jsonLd";
import styles from "./Breadcrumbs.module.css";

export type BreadcrumbItem = {
    name: string;
    // Ruta interna con barra final: "/tienda/".
    href: string;
};

type BreadcrumbsProps = {
    // De la raíz a la página actual. El último es la página actual:
    // se muestra sin enlace.
    items: BreadcrumbItem[];
};

// Migas de pan visibles + su JSON-LD (BreadcrumbList) para Google.
// Server Component: sin estado ni eventos, todo sale en el HTML inicial.
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: new URL(item.href, siteConfig.SITE_URL).toString(),
        })),
    };

    return (
        <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />

            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isCurrent = index === items.length - 1;

                    return (
                        <li key={item.href} className={styles.item}>
                            {isCurrent ? (
                                <span aria-current="page">{item.name}</span>
                            ) : (
                                <Link href={item.href}>{item.name}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
