import type { MetadataRoute} from "next";

import { siteConfig} from "@/config/site";
import { getAllPosts, getPostCategories } from "@/services/blogService";
import { getAllCategories, getAllProducts, getBrands } from "@/services/productService";
import { BLOG_PATH, postCategoryPath, postPath } from "@/utils/blogPath";
import { brandPath } from "@/utils/brandPath";
import { categoryPath } from "@/utils/categoryPath";
import { productPath } from "@/utils/productPath";

// Páginas públicas que solo existen en Next. Cada página nueva que deba
// indexarse (contacto, legales…) se añade aquí: WordPress no sabe que existe.
// Las privadas (carrito, login, cuenta, pedido) no entran nunca y llevan
// noindex en su metadata.
const STATIC_PATHS = ["/", "/tienda/", "/about/", "/contacto/", "/faq/", BLOG_PATH];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, brands, categories, posts, postCategories] =
        await Promise.all([
            getAllProducts(),
            getBrands(),
            getAllCategories(),
            getAllPosts(),
            getPostCategories(),
        ]);

    const paths = [
        ...STATIC_PATHS,
        ...products.filter((product) => product.slug).map(productPath),
        ...brands.map((brand) => brandPath(brand.slug)),
        // Las que Yoast marca como "no indexar" no deben anunciarse.
        ...categories
            .filter((category) => !category.noindex)
            .map((category) => categoryPath(category.path)),
        ...postCategories.map((category) => postCategoryPath(category.slug)),
    ];

    // Los artículos llevan su fecha real de modificación
    const postEntries = posts.map((post) => ({
        url: `${siteConfig.SITE_URL}${postPath(post.slug)}`,
        lastModified: post.modified,
    }));

    return [
        ...[...new Set(paths)].map((path) => ({
            url: `${siteConfig.SITE_URL}${path}`,
        })),
        ...postEntries,
    ];
}