import type { Seo } from "./seo";

// Página de marca: GET /reactafy/v1/brands/{slug}
export type Brand = {
    id: number;
    slug: string;
    name: string;
    description: string;
    seo: Seo | null;
};
