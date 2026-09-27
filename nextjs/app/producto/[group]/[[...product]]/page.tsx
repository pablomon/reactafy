import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import styles from "@/components/product/ProductPage.module.css";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";
import Price from "@/components/Price";
import AddToCartForm from "@/components/product/AddToCartForm";
import BulkPrices from "@/components/product/BulkPrices";
import ProductImage from "@/components/product/ProductImage";
import ProductCarousel from "@/components/product/ProductCarousel";
import ProductNotes from "@/components/product/ProductNotes";
import ProductSelectors from "@/components/product/ProductSelectors";
import ProductTabs from "@/components/product/ProductTabs";
import { getStore } from "@/services/storeService";
import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import { resolveProduct } from "@/services/productService";
import {
    getGuestProductPrices,
    getProductPrices,
} from "@/services/pricingService";
import { productFormat, productUnits } from "@/utils/productFormat";
import { productSelectors } from "@/utils/productSelectors";
import { serializeJsonLd } from "@/utils/jsonLd";
import { productJsonLd } from "@/utils/productJsonLd";
import { productPath } from "@/utils/productPath";
import { brandPath } from "@/utils/brandPath";

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

    // Precio visible: el del usuario (con sesión) o el de invitado.
    // Se pinta en streaming con <Price>, no se espera aquí.
    // Una sola petición para el producto y sus upsells ("Te puede interesar").
    const pricesPromise = getProductPrices([
        product.id,
        ...product.upsells.map((upsell) => upsell.id),
    ]);

    // Precio para el JSON-LD: siempre el de invitado. Si falla, la
    // página se pinta igual, solo que sin oferta en los datos estructurados.
    const guestPrices: Record<number, ProductPrice | undefined> =
        await getGuestProductPrices([product.id]).catch(() => ({}));

    const jsonLd = productJsonLd(product, guestPrices[product.id]);
    const format = productFormat(product);

    // Tienda › Marca › Producto (la marca solo si el producto la tiene).
    const breadcrumbs: BreadcrumbItem[] = [
        { name: "Tienda", href: "/tienda/" },
        ...(product.brand
            ? [{ name: product.brand.name, href: brandPath(product.brand.slug) }]
            : []),
        {
            name: format ? `${product.title} ${format}` : product.title,
            href: productPath(product),
        },
    ];

    // Misma petición que el layout: Next la memoiza
    const store = await getStore();

    const units = productUnits(product);
    const selectors = productSelectors(product, product.groupProducts);

    // Como en las tarjetas: la subcategoría ("Cerveza") antes que la de primer nivel
    const category =
        product.categories.find((item) => item.parentId !== 0) ??
        product.categories[0];

    const isAlcohol = product.tags.some((tag) => tag.slug === "alcohol");
    const outOfStock = product.stock.status === "out_of_stock";

    return (
        <main className={styles.page}>
            {/* Datos estructurados para Google. Un <script> normal (no
                next/script): son datos, no código que ejecutar. */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />

            <div className={styles.container}>
                <Breadcrumbs items={breadcrumbs} />
            </div>

            {/* Franja azul claro: imagen, datos, selectores y compra */}
            <section className={styles.hero}>
                <div className={`${styles.container} ${styles.heroInner}`}>
                    <div className={styles.media}>
                        {units && (
                            <span className={styles.unitsPill}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" strokeLinejoin="round" />
                                    <path d="m3 7.5 9 4.5 9-4.5M12 12v9" strokeLinejoin="round" />
                                </svg>
                                La caja contiene {units}
                            </span>
                        )}

                        {product.image && (
                            <ProductImage
                                className={styles.image}
                                src={product.image}
                                alt={format ? `${product.title} ${format}` : product.title}
                            />
                        )}

                        {product.sku && (
                            <p className={styles.sku}>sku {product.sku}</p>
                        )}
                    </div>

                    <div className={styles.content}>
                        <div className={styles.info}>
                            {category && (
                                <p className={styles.category}>{category.name}</p>
                            )}

                            <h1 className={styles.title}>{product.title}</h1>

                            {format && <p className={styles.format}>{format}</p>}

                            <Price
                                productId={product.id}
                                pricesPromise={pricesPromise}
                                // Precio de 1 caja: los tramos van en la tabla
                                showFrom={false}
                                showSaving
                            />

                            {product.brand && (
                                <Link href={brandPath(product.brand.slug)} className={styles.brand}>
                                    {product.brand.name}
                                </Link>
                            )}
                        </div>

                        <ProductSelectors selectors={selectors} group={product.group} />

                        <BulkPrices productId={product.id} pricesPromise={pricesPromise} />

                        <div className={styles.buy}>
                            <AddToCartForm
                                // Otro producto = formulario nuevo (cantidad a 1)
                                key={product.id}
                                productId={product.id}
                                title={product.title}
                                outOfStock={outOfStock}
                            />
                        </div>

                        <div className={styles.notesRow}>
                            <ProductNotes
                                isAlcohol={isAlcohol}
                                minOrder={store.minOrder}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.container}>
                <ProductTabs
                    key={product.id}
                    attributes={product.attributes}
                    descriptionHtml={product.description}
                    brand={
                        product.brand
                            ? {
                                name: product.brand.name,
                                descriptionHtml: product.brand.description,
                            }
                            : null
                    }
                />

                <ProductCarousel
                    title="Te puede interesar"
                    products={product.upsells}
                    pricesPromise={pricesPromise}
                />
            </div>
        </main>
    );
}
