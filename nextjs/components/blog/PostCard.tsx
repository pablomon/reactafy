import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/types/post";
import { postCategoryPath, postPath } from "@/utils/blogPath";
import { formatDate } from "@/utils/formatDate";
import styles from "./PostCard.module.css";

// Tamaño de la imagen según las columnas del listado (1, 2 o 3).
const IMAGE_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

type PostCardProps = {
    post: PostSummary;
    // Zona horaria de la tienda (ajustes de WordPress), para escribir la fecha
    timeZone: string;
    // Imagen por encima del pliegue: se pide ya y con prioridad alta.
    eagerImage?: boolean;
};

// Un artículo en un listado: imagen, categoría, título, extracto y fecha.
export default function PostCard({
    post,
    timeZone,
    eagerImage = false,
}: PostCardProps) {
    const href = postPath(post.slug);
    const category = post.categories[0];
    const image = post.featuredImage;

    return (
        <article className={styles.card}>
            {image ? (
                // Enlace duplicado del título: fuera del orden de tabulación
                <Link
                    href={href}
                    className={styles.imageLink}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <Image
                        src={image.url}
                        alt=""
                        width={image.width}
                        height={image.height}
                        sizes={IMAGE_SIZES}
                        className={styles.image}
                        loading={eagerImage ? "eager" : undefined}
                        fetchPriority={eagerImage ? "high" : undefined}
                    />
                </Link>
            ) : (
                // Sin imagen, un hueco de la misma forma: la cuadrícula no se descuadra
                <div className={styles.imageLink} />
            )}

            <div className={styles.body}>
                {category && (
                    <Link href={postCategoryPath(category.slug)} className={styles.category}>
                        {category.name}
                    </Link>
                )}

                <h2 className={styles.title}>
                    <Link href={href}>{post.title}</Link>
                </h2>

                <p className={styles.excerpt}>{post.excerpt}</p>

                <time dateTime={post.date} className={styles.date}>
                    {formatDate(post.date, timeZone)}
                </time>
            </div>
        </article>
    );
}
