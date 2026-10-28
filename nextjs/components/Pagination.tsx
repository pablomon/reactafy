import Link from "next/link";
import styles from "./Pagination.module.css";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    // Dirección del listado, con barra final: "/blog/" o "/tienda/".
    basePath: string;
};

// La primera página es la propia dirección del listado, sin "?page=1":
// así no hay dos direcciones para la misma página.
function pageHref(basePath: string, page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export default function Pagination({
    currentPage,
    totalPages,
    basePath,
}: PaginationProps) {
    // Con una sola página no hay nada que paginar
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className={styles.pagination} aria-label="Paginación">
            {currentPage > 1 && (
                <Link
                    className={styles.link}
                    href={pageHref(basePath, currentPage - 1)}
                    aria-label="Página anterior"
                >
                    ←
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isCurrent = page === currentPage;

                return (
                    <Link
                        key={page}
                        className={`${styles.link} ${isCurrent ? styles.active : ""}`}
                        href={pageHref(basePath, page)}
                        aria-current={isCurrent ? "page" : undefined}
                    >
                        {page}
                    </Link>
                );
            })}

            {currentPage < totalPages && (
                <Link
                    className={styles.link}
                    href={pageHref(basePath, currentPage + 1)}
                    aria-label="Página siguiente"
                >
                    →
                </Link>
            )}
        </nav>
    );
}
