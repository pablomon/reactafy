import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";
import PostContent from "@/components/blog/PostContent";
import { getPost } from "@/services/blogService";
import { getStore } from "@/services/storeService";
import { BLOG_PATH, postCategoryPath, postPath } from "@/utils/blogPath";
import { formatDate } from "@/utils/formatDate";
import { serializeJsonLd } from "@/utils/jsonLd";
import { postJsonLd } from "@/utils/postJsonLd";
import styles from "../../page.module.css";

type PostPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
    const post = await getPost((await props.params).slug);
    if (!post) return {};

    const title = post.seo?.title || `${post.title} - Aguafy`;
    // Ningún artículo tiene descripción en Yoast: se usa el extracto
    const description = post.seo?.description || post.excerpt || undefined;

    return {
        title,
        description,
        alternates: { canonical: postPath(post.slug) },
        robots: post.seo?.noindex ? { index: false, follow: true } : undefined,
        openGraph: {
            type: "article",
            title,
            description,
            url: postPath(post.slug),
            publishedTime: post.date,
            modifiedTime: post.modified,
            images: post.seo?.ogImage ?? post.featuredImage?.url ?? undefined,
        },
    };
}

export default async function PostPage(props: PostPageProps) {
    const { slug } = await props.params;
    // Misma petición que generateMetadata: Next la memoiza
    const [post, store] = await Promise.all([getPost(slug), getStore()]);
    if (!post) notFound();

    const category = post.categories[0];

    // Blog › Categoría › Artículo (la categoría solo si tiene)
    const breadcrumbs: BreadcrumbItem[] = [
        { name: "Blog", href: BLOG_PATH },
        ...(category
            ? [{ name: category.name, href: postCategoryPath(category.slug) }]
            : []),
        { name: post.title, href: postPath(post.slug) },
    ];

    const image = post.featuredImage;

    return (
        <main>
            <div className={styles.main}>
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <article className={styles.article}>
                <h1 className={styles.title}>{post.title}</h1>
                <p className={styles.meta}>
                    <time dateTime={post.date}>
                        {formatDate(post.date, store.timezone)}
                    </time>
                </p>

                {image && (
                    <Image
                        src={image.url}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                        sizes="(min-width: 800px) 760px, 100vw"
                        className={styles.cover}
                        // Es lo primero grande de la página (LCP)
                        priority
                    />
                )}

                <PostContent html={post.content} />
            </article>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: serializeJsonLd(postJsonLd(post)),
                }}
            />
        </main>
    );
}
