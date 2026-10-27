import type { Seo } from "./seo";

// Un tramo de la ruta de una categoría: { slug: "agua", name: "Agua" }
export type CategoryPathItem = {
    slug: string;
    name: string;
};

// Una categoría en la lista completa: GET /reactafy/v1/categories
export type CategorySummary = {
    id: number;
    slug: string;
    name: string;
    // De la raíz a la propia categoría: [Bebidas, Agua]
    path: CategoryPathItem[];
    // Productos de la tienda en esa categoría o en las de debajo
    count: number;
    // Yoast la marca como "no indexar"
    noindex: boolean;
};

// Página de categoría: GET /reactafy/v1/categories/{slug}
export type Category = {
    id: number;
    slug: string;
    name: string;
    description: string;
    // De la raíz a la propia categoría: [Bebidas, Agua]
    path: CategoryPathItem[];
    seo: Seo | null;
};
