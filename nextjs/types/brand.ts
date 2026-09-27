import type { Seo } from "./seo";

// Página de marca: GET /reactafy/v1/brands/{slug}
export type Brand = {
    id: number;
    slug: string;
    name: string;
    description: string;
    seo: Seo | null;
};

// Marca en un listado (panel "Buscar"): GET /reactafy/v1/brands
export type BrandSummary = {
    id: number;
    slug: string;
    name: string;
    // Logo 150×150 de Woo, o null si la marca no tiene
    image: string | null;
};
