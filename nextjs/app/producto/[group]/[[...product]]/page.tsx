import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import styles from "./page.module.css";
import AddToCartButton from "@/components/AddToCartButton";
import Price from "@/components/Price";
import type { Product } from "@/types/product";
import { resolveProduct } from "@/services/productService";
import { getProductPrices } from "@/services/pricingService";
import { productFormat } from "@/utils/productFormat";
import { productPath } from "@/utils/productPath";

// /producto/{group}                   → product = undefined
// /producto/{group}/{product}         → product = ["24-lata-500-ml"]
// /producto/{group}/{product}/{otro}  → product = [..., ...] → 404
type SearchParams = Record<string, string | string[] | undefined>;

type ProductPageProps = {
    params: Promise<{ group: string; product?: string[] }>;
    searchParams: Promise<SearchParams>;
};

// Separa los parámetros antiguos de Woo (?attribute_pa_…) del resto
// (utm_…, fbclid…), que se conservan al redirigir.
function splitSearchParams(searchParams: SearchParams) {
    const legacy: Record<string, string> = {};
    const rest = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        // Parámetros repetidos (?a=1&a=2) llegan como array: se ignoran.
        if (typeof value !== "string") continue;

        if (key.startsWith("attribute_")) {
            legacy[key] = value;
        } else {
            rest.set(key, value);
        }
    }

    return { legacy, rest };
}

// Lo comparten la página y generateMetadata. Las dos piden la misma
// URL a WordPress y Next deduplica el fetch: sale una sola petición.
async function loadProduct(props: ProductPageProps) {
    const { group, product } = await props.params;

    if (product && product.length > 1) {
        notFound();
    }

    const { legacy, rest } = splitSearchParams(await props.searchParams);

    // Los segmentos llegan codificados (%C3%B1…): se decodifican antes
    // de enviarlos, o URLSearchParams los codificaría dos veces.
    const requested = product?.[0] ? decodeURIComponent(product[0]) : null;

    const resolved = await resolveProduct(
        decodeURIComponent(group),
        requested,
        legacy
    );

    if (!resolved) {
        notFound();
    }

    return { requested, resolved, legacy, rest };
}

// Título de Yoast (del grupo) con el formato del producto antes del
// nombre del sitio: "Estrella Galicia lata - Aguafy"
//                 → "Estrella Galicia lata 24 latas de 500 ml - Aguafy"
function seoTitle(product: Product) {
    const base = product.seo?.title || product.title;
    const format = productFormat(product);

    if (!format) return base;

    // Última " - ", " | ", " – " o " · ": separa el título del nombre del sitio.
    const match = base.match(/^(.*)(\s[-–|·•]\s.+)$/);

    return match
        ? `${match[1]} ${format}${match[2]}`
        : `${base} ${format}`;
}

export async function generateMetadata(
    props: ProductPageProps
): Promise<Metadata> {
    const { resolved: product } = await loadProduct(props);
    const seo = product.seo;
    const title = seoTitle(product);

    return {
        title,
        description: seo?.description || undefined,
        alternates: {
            canonical: productPath(product),
        },
        robots: seo?.noindex ? { index: false, follow: true } : undefined,
        openGraph: {
            title,
            description: seo?.description || undefined,
            url: productPath(product),
            images: seo?.ogImage ?? product.image ?? undefined,
        },
    };
}

export default async function ProductPage(props: ProductPageProps) {
    const { requested, resolved: product, legacy, rest } =
        await loadProduct(props);

    // ¿Es la URL oficial del producto? Si no (grupo sin producto, slug
    // desconocido o ?attribute_pa_…), 308 a la buena, conservando utm_….
    const isCanonicalUrl =
        requested === product.slug && Object.keys(legacy).length === 0;

    if (!isCanonicalUrl) {
        const query = rest.toString();
        permanentRedirect(productPath(product) + (query ? `?${query}` : ""));
    }

    const pricesPromise = getProductPrices([product.id]);
    const format = productFormat(product);

    return (
        <main className={styles.container}>
            <div className={styles.product}>
                <div className={styles.imageBox}>
                    {product.image && (
                        <Image
                            className={styles.image}
                            src={product.image}
                            alt={product.title}
                            width={500}
                            height={500}
                            priority
                        />
                    )}
                </div>

                <div className={styles.info}>
                    <h1 className={styles.title}>
                        {product.title}
                    </h1>

                    {format && <p>{format}</p>}

                    {product.brand && (
                        <p className={styles.brand}>
                            {product.brand.name}
                        </p>
                    )}

                    <div className={styles.attributes}>
                        {product.attributes.map((attribute) => (
                            <p key={attribute.slug}>
                                {attribute.name}: {attribute.value}
                            </p>
                        ))}
                    </div>

                    <Price
                        productId={product.id}
                        pricesPromise={pricesPromise}
                    />

                    <p className={styles.sku}>
                        SKU: {product.sku}
                    </p>

                    <AddToCartButton productId={product.id} />
                </div>
            </div>
        </main>
    );
}
