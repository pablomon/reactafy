import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryChips from "@/components/CategoryChips";
import ProductGrid from "@/components/ProductGrid";
import ActiveFilters from "@/components/shop/ActiveFilters";
import ShopFilters from "@/components/shop/ShopFilters";
import { getCategory, getProducts } from "@/services/productService";
import { getProductPrices } from "@/services/pricingService";
import { categoryPath } from "@/utils/categoryPath";
import { toQuery, withQuery, type SearchParams } from "@/utils/filterUrl";
import styles from "./page.module.css";

type TiendaPageProps = {
    // [[...categoria]]: undefined en /tienda/, ["bebidas","agua"] en /tienda/bebidas/agua/
    params: Promise<{ categoria?: string[] }>;
    // Filtros, orden y página: ?brand=perrier&envase=vidrio&orderby=price&page=2
    searchParams: Promise<SearchParams>;
};

// Lo comparten la página y generateMetadata (Next deduplica el fetch).
async function loadCategory(props: TiendaPageProps) {
    const { categoria = [] } = await props.params;
    const segments = categoria.map(decodeURIComponent);

    if (segments.length === 0) {
        return { segments, category: null };
    }

    // La categoría es el último segmento; los anteriores se validan con su path
    const category = await getCategory(segments[segments.length - 1]);

    if (!category) {
        notFound();
    }

    return { segments, category };
}

export async function generateMetadata(
    props: TiendaPageProps
): Promise<Metadata> {
    const { category } = await loadCategory(props);

    if (!category) {
        return {
            title: "Tienda - Aguafy",
            alternates: { canonical: "/tienda/" },
        };
    }

    const seo = category.seo;
    const path = categoryPath(category.path);

    return {
        title: seo?.title || `${category.name} - Aguafy`,
        description: seo?.description || category.description || undefined,
        alternates: { canonical: path },
        robots: seo?.noindex ? { index: false, follow: true } : undefined,
        openGraph: {
            url: path,
            images: seo?.ogImage ?? undefined,
        },
    };
}

export default async function TiendaPage(props: TiendaPageProps) {
    const { segments, category } = await loadCategory(props);
    const query = toQuery(await props.searchParams);

    // URL canónica: la ruta real de la categoría en Woo.
    // /tienda/agua/ → /tienda/bebidas/agua/ (conservando ?utm_…)
    if (category) {
        const canonical = category.path.map((item) => item.slug);

        if (segments.join("/") !== canonical.join("/")) {
            permanentRedirect(withQuery(categoryPath(category.path), query));
        }
    }

    const page = Number(query.get("page")) || 1;

    // Todo lo demás (facetas, orden, utm…) se pasa tal cual a WordPress,
    // que ignora lo que no conoce: aquí no hay lista de facetas.
    query.delete("page");
    const filters = Object.fromEntries(query);
    const queryString = query.toString();

    const data = await getProducts({ page, category: category?.slug, filters });
    const pricesPromise = getProductPrices(
        data.products.map((product) => product.id)
    );

    const path = category?.path ?? [];
    const basePath = categoryPath(path);
    const hasFilters = data.facets.some((facet) => query.has(facet.slug));

    return (
        <main className={styles.main}>
            {category && (
                <Breadcrumbs
                    items={[
                        { name: "Tienda", href: "/tienda/" },
                        ...path.map((item, i) => ({
                            name: item.name,
                            href: categoryPath(path.slice(0, i + 1)),
                        })),
                    ]}
                />
            )}

            {category ? (
                <h1 className={styles.title}>{category.name}</h1>
            ) : (
                // Oculto a la vista, pero sigue siendo el título para SEO y lectores de pantalla
                <h1 className={styles.visuallyHidden}>Tienda</h1>
            )}

            <CategoryChips parentPath={path} items={data.subcategories} />

            <ShopFilters
                facets={data.facets}
                basePath={basePath}
                queryString={queryString}
                total={data.pagination.total}
            />

            <ActiveFilters
                facets={data.facets}
                basePath={basePath}
                queryString={queryString}
            />

            {data.products.length === 0 ? (
                <p>
                    {hasFilters
                        ? "No hay productos con estos filtros."
                        : "Ahora mismo no hay productos en esta categoría."}
                </p>
            ) : (
                <ProductGrid
                    // Otra categoría u otros filtros = grid nuevo (reinicia su estado)
                    key={`${category?.slug ?? "all"}?${queryString}`}
                    initialProducts={data.products}
                    initialPage={page}
                    totalPages={data.pagination.totalPages}
                    initialPricesPromise={pricesPromise}
                    category={category?.slug}
                    filters={filters}
                />
            )}
        </main>
    );
}
