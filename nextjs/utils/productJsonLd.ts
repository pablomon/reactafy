import type { Product } from "@/types/product";
import type { ProductPrice } from "@/types/productPrice";
import { siteConfig } from "@/config/site";
import { moneyToNumber } from "@/utils/money";
import { productFormat } from "@/utils/productFormat";
import { productPath } from "@/utils/productPath";

// Datos estructurados (schema.org, formato JSON-LD) de un producto:
// Google los usa para mostrar precio y stock en los resultados.
//
// Reglas: todo sale de los mismos datos que la página (misma URL que el
// canonical, mismo nombre que el título) y el precio es el de invitado,
// que es lo que ve Google al rastrear sin sesión.

const AVAILABILITY: Record<string, string> = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    on_backorder: "https://schema.org/BackOrder",
};

export function productJsonLd(
    product: Product,
    guestPrice: ProductPrice | undefined
) {
    const url = new URL(productPath(product), siteConfig.SITE_URL).toString();
    const format = productFormat(product);
    const availability = AVAILABILITY[product.stock.status];

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: format ? `${product.title} ${format}` : product.title,
        url,
        // Solo se incluyen las propiedades que tienen valor.
        ...(product.image ? { image: product.image } : {}),
        ...(product.seo?.description
            ? { description: product.seo.description }
            : {}),
        ...(product.sku ? { sku: product.sku } : {}),
        ...(product.brand
            ? { brand: { "@type": "Brand", name: product.brand.name } }
            : {}),
        // Sin precio no hay oferta: mejor omitirla que inventarla.
        ...(guestPrice
            ? {
                offers: {
                    "@type": "Offer",
                    url,
                    // Precio unitario (comprando 1), con sus decimales:
                    // "875.30". El "desde" por volumen no se declara.
                    price: moneyToNumber(guestPrice.price).toFixed(
                        guestPrice.price.minorUnit
                    ),
                    priceCurrency: guestPrice.price.currency,
                    itemCondition: "https://schema.org/NewCondition",
                    ...(availability ? { availability } : {}),
                },
            }
            : {}),
    };
}

// El JSON va dentro de <script>: si algún texto contuviera "</script>",
// cerraría la etiqueta. Se escapa "<" (recomendación de la guía JSON-LD
// de Next).
export function serializeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
