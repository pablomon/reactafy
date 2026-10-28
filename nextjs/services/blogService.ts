import { siteConfig } from "@/config/site";
import { cached, CacheTag } from "@/services/wpCache";
import type {
    Post,
    PostCategory,
    PostSummary,
    PostsResponse,
} from "@/types/post";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Artículos por página en los listados
export const POSTS_PER_PAGE = 9;

type PostsQuery = {
    page?: number;
    // Slug de la categoría
    category?: string;
};

// Una página de artículos, del más nuevo al más antiguo.
// null si la categoría no existe (404 de WordPress).
export async function getPosts(
    { page = 1, category }: PostsQuery = {}
): Promise<PostsResponse | null> {
    const query = new URLSearchParams({
        page: String(page),
        perPage: String(POSTS_PER_PAGE),
    });

    if (category) {
        query.set("category", category);
    }

    const response = await fetch(
        `${API_URL}/posts?${query}`,
        cached(CacheTag.Blog)
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return response.json();
}

// Un artículo completo. null si no existe (404 de WordPress).
export async function getPost(slug: string): Promise<Post | null> {
    const response = await fetch(
        `${API_URL}/posts/${encodeURIComponent(slug)}`,
        cached(CacheTag.Blog)
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch post");
    }

    return response.json();
}

// Las categorías del blog, con su número de artículos.
export async function getPostCategories(): Promise<PostCategory[]> {
    const response = await fetch(
        `${API_URL}/post-categories`,
        cached(CacheTag.Blog)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch post categories");
    }

    return response.json();
}

// Todos los artículos publicados, página a página (la API da 50 como máximo).
// Para el sitemap y las redirecciones de las direcciones antiguas.
//
// Se acaba por totalPages, no contando artículos.
export async function getAllPosts(): Promise<PostSummary[]> {
    const all: PostSummary[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const response = await fetch(
            `${API_URL}/posts?page=${page}&perPage=50`,
            cached(CacheTag.Blog)
        );

        if (!response.ok) {
            throw new Error("Failed to fetch all posts");
        }

        const data: PostsResponse = await response.json();

        all.push(...data.posts);
        totalPages = data.pagination.totalPages;
        page++;
    } while (page <= totalPages);

    return all;
}
