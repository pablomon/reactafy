import { siteConfig } from "@/config/site";

// Las webs que, para un enlace de un banner, cuentan como "esta misma web":
// la tienda y WordPress. Un enlace a WordPress se convierte en una ruta
// relativa, para que siga valiendo el día que cambien los dominios.
const OWN_HOSTS = [siteConfig.SITE_URL, siteConfig.WORDPRESS_URL]
    .filter((url): url is string => Boolean(url))
    .map((url) => new URL(url).host);

export type LinkTarget = {
    href: string;
    external: boolean;
};

// Enlace escrito por una persona en WordPress → adónde llevar al cliente.
// Devuelve null si no hay enlace o si no es seguro (javascript:, etc.).
export function resolveLink(link: string | null): LinkTarget | null {
    if (!link) {
        return null;
    }

    // "/producto/x/" es interna; "//otra-web.com" no: el navegador la
    // trata como otra web.
    if (link.startsWith("/") && !link.startsWith("//")) {
        return { href: link, external: false };
    }

    let url: URL;

    try {
        url = new URL(link);
    } catch {
        return null;
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
        return null;
    }

    if (OWN_HOSTS.includes(url.host)) {
        return { href: url.pathname + url.search + url.hash, external: false };
    }

    return { href: link, external: true };
}
