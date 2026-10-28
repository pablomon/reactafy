import { siteConfig } from "@/config/site";
import type { Post } from "@/types/post";
import { postPath } from "@/utils/blogPath";

// Datos estructurados (schema.org, formato JSON-LD) de un artículo del blog.
//
// Como en los productos: todo sale de los mismos datos que la página (misma
// URL que el canonical, mismo título) y solo se incluyen las propiedades que
// tienen valor.
export function postJsonLd(post: Post) {
    const url = new URL(postPath(post.slug), siteConfig.SITE_URL).toString();

    // Quien firma es la empresa, no la cuenta de WordPress que lo publicó
    const organization = {
        "@type": "Organization",
        name: siteConfig.SITE_NAME,
        logo: siteConfig.LOGO_URL,
    };

    // Ningún artículo tiene descripción en Yoast: se usa el extracto
    const description = post.seo?.description || post.excerpt;

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: post.date,
        dateModified: post.modified,
        inLanguage: "es-MX",
        author: organization,
        publisher: organization,
        ...(description ? { description } : {}),
        ...(post.featuredImage ? { image: post.featuredImage.url } : {}),
    };
}
