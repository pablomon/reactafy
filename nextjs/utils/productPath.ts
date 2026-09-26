import type { Product } from "@/types/product";

// La URL pública de un producto: /producto/{grupo}/{producto}/
// (con barra final, como WordPress: ver trailingSlash en next.config)
//
// Es el ÚNICO sitio donde se construye: tarjetas, canonical y
// redirecciones la usan. Cambiar el formato (p. ej. añadir la barra
// final antes del go-live) es cambiar esta función.
export function productPath(product: Pick<Product, "slug" | "group">): string {
    if (!product.slug) {
        return `/producto/${product.group.slug}/`;
    }

    return `/producto/${product.group.slug}/${product.slug}/`;
}
