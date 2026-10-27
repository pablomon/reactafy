import type { MetadataRoute} from "next";

import { siteConfig} from "@/config/site";
import { getAllProducts, getBrands } from "@/services/productService";
import { brandPath } from "@/utils/brandPath";
import { productPath } from "@/utils/productPath";

// Páginas públicas que solo existen en Next. Cada página nueva que deba
// indexarse (contacto, legales…) se añade aquí: WordPress no sabe que existe.
// Las privadas (carrito, login, cuenta, pedido) no entran nunca y llevan
// noindex en su metadata.
const STATIC_PATHS = ["/", "/tienda/"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, brands] = await Promise.all([
        getAllProducts(),
        getBrands(),
    ]);

    const paths = [
        ...STATIC_PATHS,
        ...products.filter((product) => product.slug).map(productPath),
        ...brands.map((brand) => brandPath(brand.slug)),
    ];

    return [...new Set(paths)].map((path) => ({
        url: `${siteConfig.SITE_URL}${path}`,
    }));
}