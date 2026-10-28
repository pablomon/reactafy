import Pagination from "@/components/Pagination";
import type { PostsResponse } from "@/types/post";
import PostCard from "./PostCard";
import styles from "./PostList.module.css";

type PostListProps = {
    data: PostsResponse;
    // Zona horaria de la tienda, para escribir las fechas
    timeZone: string;
    // Dirección del listado, con barra final: "/blog/"
    basePath: string;
};

// Cuadrícula de artículos + paginación. La usan la portada del blog y
// cada categoría.
export default function PostList({ data, timeZone, basePath }: PostListProps) {
    const { posts, pagination } = data;

    return (
        <>
            <div className={styles.grid}>
                {posts.map((post, index) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        timeZone={timeZone}
                        // Las 3 primeras (primera fila en escritorio) se piden ya
                        eagerImage={index < 3}
                    />
                ))}
            </div>
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                basePath={basePath}
            />
        </>
    );
}
