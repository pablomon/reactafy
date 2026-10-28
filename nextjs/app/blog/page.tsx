import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PostList from "@/components/blog/PostList";
import { getPostCategories, getPosts } from "@/services/blogService";
import { getStore } from "@/services/storeService";
import { BLOG_PATH, postCategoryPath, postPath } from "@/utils/blogPath";
import { parsePage } from "@/utils/parsePage";
import GuideIcon from "./GuideIcons";
import hero from "./images/hero.png";
import styles from "./page.module.css";

type BlogPageProps = {
    // ?page=2
    searchParams: Promise<{ page?: string }>;
};

// Orden de las guías (la API las da por orden alfabético). Una categoría
// nueva, que no esté aquí, va al final.
const GUIDE_ORDER = [
    "operacion-inteligente",
    "hospitalidad-premium",
    "destras-de-la-operacion",
];

function guideRank(slug: string) {
    const index = GUIDE_ORDER.indexOf(slug);
    return index === -1 ? GUIDE_ORDER.length : index;
}

export const metadata: Metadata = {
    title: "Blog - Aguafy",
    description:
        "Ideas y guías para restaurantes, hoteles y negocios de hospitalidad: operación, bebidas y detrás de escena.",
    alternates: { canonical: BLOG_PATH },
};

export default async function BlogPage(props: BlogPageProps) {
    const page = parsePage((await props.searchParams).page);
    if (page === null) notFound();

    const [data, categories, store] = await Promise.all([
        getPosts({ page }),
        getPostCategories(),
        getStore(),
    ]);

    // Sin respuesta, o una página que no existe (?page=99)
    if (!data || (page > 1 && data.posts.length === 0)) notFound();

    // El destacado es el artículo más reciente, y solo en la primera página
    const featured = page === 1 ? data.posts[0] : undefined;

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <Image
                    src={hero}
                    alt=""
                    className={styles.heroImage}
                    sizes="(min-width: 1200px) 600px, 100vw"
                    priority
                />
                <div className={styles.heroText}>
                    <p className={styles.badge}>Blog Aguafy</p>
                    <h1 className={styles.heroTitle}>
                        Ideas para una operación más eficiente
                    </h1>
                    <p>
                        Contenido práctico para negocios que quieren optimizar su
                        servicio, mejorar la experiencia y crecer.
                    </p>
                </div>
            </section>

            <section className={styles.guides}>
                <h2 className={styles.sectionTitle}>
                    {categories.length} guías de contenido
                </h2>
                <div className={styles.guideGrid}>
                    {[...categories]
                        .sort((a, b) => guideRank(a.slug) - guideRank(b.slug))
                        .map((category) => (
                        <div key={category.slug} className={styles.guide}>
                            <div className={styles.guideIcon}>
                                <GuideIcon slug={category.slug} />
                            </div>
                            <div>
                                <h3 className={styles.guideTitle}>{category.name}</h3>
                                <p className={styles.guideText}>
                                    {category.description}
                                </p>
                                <Link
                                    href={postCategoryPath(category.slug)}
                                    className={styles.guideLink}
                                >
                                    Ver artículos →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {featured && (
                <section className={styles.featured}>
                    {featured.featuredImage && (
                        <Image
                            src={featured.featuredImage.url}
                            width={featured.featuredImage.width}
                            height={featured.featuredImage.height}
                            alt=""
                            sizes="(min-width: 1200px) 585px, 100vw"
                            className={styles.featuredImage}
                            priority
                        />
                    )}
                    <div className={styles.featuredText}>
                        <p className={styles.featuredBadge}>Artículo destacado</p>
                        <h2 className={styles.featuredTitle}>{featured.title}</h2>
                        <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                        <Link
                            href={postPath(featured.slug)}
                            className={styles.featuredButton}
                        >
                            Leer artículo →
                        </Link>
                    </div>
                </section>
            )}

            <section className={styles.recent}>
                <h2 className={styles.sectionTitle}>Artículos recientes</h2>
                <PostList data={data} timeZone={store.timezone} basePath={BLOG_PATH} />
            </section>
        </main>
    );
}
