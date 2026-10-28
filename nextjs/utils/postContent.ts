import { resolveLink } from "@/utils/sitePath";

// El HTML de un artículo llega ya limpio de WordPress (wp_kses_post), pero
// sus enlaces están escritos como los puso quien redactó el artículo:
// "https://aguafy.com/tienda/". Aquí se corrigen:
//
// - Los que apuntan a esta web o a WordPress pasan a ser rutas relativas
//   ("/tienda/"), para que sigan valiendo cuando cambien los dominios.
// - Los que apuntan a otra web llevan rel="noopener noreferrer".
// - Los demás (mailto:, tel:, #ancla…) se dejan como están.
const ANCHOR = /<a\b([^>]*)>/gi;
const HREF = /\bhref="([^"]*)"/i;

export function prepareContent(html: string): string {
    return html.replace(ANCHOR, (tag, attributes: string) => {
        const match = attributes.match(HREF);

        if (!match) {
            return tag;
        }

        // El valor de un atributo está escrito en HTML: "&amp;" es "&"
        let link = match[1].replace(/&amp;/g, "&");

        // "//otra-web.com" es una dirección completa sin el "https:". Se
        // completa para tratarla como lo que es: un enlace a otra web.
        if (link.startsWith("//")) {
            link = `https:${link}`;
        }

        const target = resolveLink(link);

        if (!target) {
            return tag;
        }

        let result = attributes.replace(
            HREF,
            () => `href="${target.href.replace(/&/g, "&amp;")}"`
        );

        if (target.external && !/\brel=/i.test(result)) {
            result += ' rel="noopener noreferrer"';
        }

        return `<a${result}>`;
    });
}
