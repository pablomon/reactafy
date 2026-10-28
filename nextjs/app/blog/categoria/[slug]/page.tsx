import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PostList from "@/components/blog/PostList";
import {
    getPostCategories,
    getPosts,
} from "@/services/blogService";
import { getStore } from "@/services/storeService";
import { BLOG_PATH, postCategoryPath } from "@/utils/blogPath";
import { parsePage } from "@/utils/parsePage";
import styles from "../../page.module.css";

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
};

// La lista de categorías se pide una vez (caché de datos) y sirve a
// la página y a sus metadatos.
async function findCategory(slug: string) {
    const categories = await getPostCategories();
    return categories.find((category) => category.slug === slug);
}

export async function generateMetadata(
    props: CategoryPageProps,
): Promise<Metadata> {
    const category = await findCategory((await props.params).slug);
    if (!category) return {};

    // Título propio: el de Yoast para categorías dice "… Archives - Aguafy"
    const title = `${category.name} - Blog - Aguafy`;
    const path = postCategoryPath(category.slug);

    return {
        title,
        description: category.description || undefined,
        alternates: { canonical: path },
        openGraph: {
            title,
            description: category.description || undefined,
            url: path,
        },
    };
}

export default async function BlogCategoryPage(props: CategoryPageProps) {
    const { slug } = await props.params;
    const page = parsePage((await props.searchParams).page);
    if (page === null) notFound();

    const [category, categories, data, store] = await Promise.all([
        findCategory(slug),
        getPostCategories(),
        getPosts({ page, category: slug }),
        getStore(),
    ]);

    if (!category || !data || (page > 1 && data.posts.length === 0)) notFound();

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>{category.name}</h1>
            {category.description && (
                <p className={styles.intro}>{category.description}</p>
            )}

            <ul className={styles.categories}>
                <li>
                    <Link href={BLOG_PATH}>Todos</Link>
                </li>
                {categories.map((item) => (
                    <li key={item.slug}>
                        <Link
                            href={postCategoryPath(item.slug)}
                            aria-current={item.slug === slug ? "page" : undefined}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            <PostList
                data={data}
                timeZone={store.timezone}
                basePath={postCategoryPath(slug)}
            />
        </main>
    );
}
