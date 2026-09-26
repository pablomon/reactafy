import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import { getBrand, getProducts } from "@/services/productService";
import { getProductPrices } from "@/services/pricingService";
import { brandPath } from "@/utils/brandPath";
import styles from "./page.module.css";

type BrandPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
};

// Lo comparten la página y generateMetadata (Next deduplica el fetch).
async function loadBrand(props: BrandPageProps) {
    const { slug } = await props.params;
    const brand = await getBrand(decodeURIComponent(slug));

    if (!brand) {
        notFound();
    }

    return { requested: decodeURIComponent(slug), brand };
}

export async function generateMetadata(
    props: BrandPageProps
): Promise<Metadata> {
    const { brand } = await loadBrand(props);
    const seo = brand.seo;

    return {
        title: seo?.title || `Productos de ${brand.name} - Aguafy`,
        description: seo?.description || brand.description || undefined,
        alternates: {
            canonical: brandPath(brand.slug),
        },
        robots: seo?.noindex ? { index: false, follow: true } : undefined,
        openGraph: {
            url: brandPath(brand.slug),
            images: seo?.ogImage ?? undefined,
        },
    };
}

export default async function BrandPage(props: BrandPageProps) {
    const { requested, brand } = await loadBrand(props);

    // WordPress encuentra la marca aunque el slug venga distinto
    // (mayúsculas…): se redirige a la URL oficial.
    if (requested !== brand.slug) {
        permanentRedirect(brandPath(brand.slug));
    }

    const { page: pageParam } = await props.searchParams;
    const page = Number(pageParam) || 1;

    const data = await getProducts({ page, filters: { brand: brand.slug } });
    const pricesPromise = getProductPrices(
        data.products.map((product) => product.id)
    );

    return (
        <main className={styles.main}>
            <Breadcrumbs
                items={[
                    { name: "Tienda", href: "/tienda/" },
                    { name: brand.name, href: brandPath(brand.slug) },
                ]}
            />

            <h1 className={styles.title}>Productos de {brand.name}</h1>

            {data.products.length === 0 ? (
                <p>Ahora mismo no hay productos de {brand.name}.</p>
            ) : (
                <ProductGrid
                    initialProducts={data.products}
                    initialPage={page}
                    totalPages={data.pagination.totalPages}
                    initialPricesPromise={pricesPromise}
                    filters={{ brand: brand.slug }}
                />
            )}
        </main>
    );
}
