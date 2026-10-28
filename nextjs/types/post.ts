import type { Seo } from "./seo";

// Imagen destacada de un artículo
export type PostImage = {
    url: string;
    width: number;
    height: number;
    // Vacío si en WordPress no se escribió uno
    alt: string;
};

// Una categoría dentro de un artículo: { slug: "hospitalidad-premium", name: "Hospitalidad premium" }
export type PostCategoryItem = {
    slug: string;
    name: string;
};

// Lo que se enseña de un artículo en un listado: GET /reactafy/v1/posts
export type PostSummary = {
    id: number;
    slug: string;
    title: string;
    // Texto plano. El del artículo, o las primeras palabras de su texto.
    excerpt: string;
    // Fechas ISO 8601 en UTC: "2026-08-03T14:23:53+00:00"
    date: string;
    modified: string;
    featuredImage: PostImage | null;
    categories: PostCategoryItem[];
};

// Un artículo completo: GET /reactafy/v1/posts/{slug}
export type Post = PostSummary & {
    // HTML ya limpio (wp_kses_post en WordPress)
    content: string;
    seo: Seo | null;
};

export type PostsPagination = {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
};

export type PostsResponse = {
    posts: PostSummary[];
    pagination: PostsPagination;
};

// Una categoría del blog: GET /reactafy/v1/post-categories
export type PostCategory = {
    id: number;
    slug: string;
    name: string;
    description: string;
    // Artículos publicados en ella
    count: number;
    seo: Seo | null;
};
