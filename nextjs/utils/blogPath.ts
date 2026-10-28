// Las direcciones del blog. Único sitio donde se construyen (listados,
// tarjetas, migas de pan, sitemap y redirecciones): si algún día cambia la
// estructura, se cambia aquí.
//
//   /blog/                          → la portada
//   /blog/categoria/{slug}/         → una categoría
//   /blog/articulo/{slug}/          → un artículo
export const BLOG_PATH = "/blog/";

export function postPath(slug: string): string {
    return `${BLOG_PATH}articulo/${slug}/`;
}

export function postCategoryPath(slug: string): string {
    return `${BLOG_PATH}categoria/${slug}/`;
}
