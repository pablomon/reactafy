import type { NextConfig } from "next";

// Aquí no valen los atajos "@/…" ni los servicios del proyecto, por eso
// esta petición a la API de WordPress se escribe a mano.
const API_URL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/reactafy/v1`;

async function fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error(`${path} → ${response.status}`);
    return response.json();
}

// Direcciones antiguas del blog (WordPress) → las nuevas. Una regla exacta
// por artículo y por categoría: así no pisan ninguna otra página. Se calcula
// al construir; los artículos nuevos no tienen dirección antigua.
// Si WordPress no responde, la construcción sigue sin ellas, con un aviso.
async function blogRedirects() {
    try {
        const slugs: string[] = [];
        let page = 1;
        let totalPages = 1;

        do {
            const data = await fetchJson<{
                posts: { slug: string }[];
                pagination: { totalPages: number };
            }>(`/posts?page=${page}&perPage=50`);
            slugs.push(...data.posts.map((post) => post.slug));
            totalPages = data.pagination.totalPages;
            page++;
        } while (page <= totalPages);

        const categories = await fetchJson<{ slug: string }[]>("/post-categories");

        return [
            ...slugs.map((slug) => ({
                source: `/${slug}`,
                destination: `/blog/articulo/${slug}/`,
                permanent: true,
            })),
            ...categories.map(({ slug }) => ({
                source: `/category/${slug}`,
                destination: `/blog/categoria/${slug}/`,
                permanent: true,
            })),
        ];
    } catch (error) {
        console.warn(
            "⚠️ SIN REDIRECCIONES DEL BLOG: no se pudo leer WordPress.",
            error,
        );
        return [];
    }
}

const nextConfig: NextConfig = {
    redirects: blogRedirects,

    // URLs con barra final, igual que WordPress (/producto/x/y/): las
    // URLs que Google ya tiene indexadas no cambian. Sin barra → 308 a
    // la versión con barra. <Link> la añade solo; fetch("/api/…") no,
    // por eso las llamadas internas llevan la barra escrita.
    trailingSlash: true,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "staging.aguafy.com",
                pathname: "/wp-content/uploads/**",
            },
            {
                protocol: "https",
                hostname: "aguafy.com",
                pathname: "/wp-content/uploads/**",
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
};

export default nextConfig;
