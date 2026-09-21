import Link from "next/link";
import styles from "./Pagination.module.css";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
};

export default function Pagination({
    currentPage,
    totalPages,
}: PaginationProps) {
    return (
        <nav className={styles.pagination}>
            {currentPage > 1 && (
                <Link
                    className={`${styles.link} ${styles.previous}`}
                    href={`/tienda?page=${currentPage - 1}`}
                >
                    Anterior
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                    <Link
                        key={page}
                        className={`${styles.link} ${
                            page === currentPage
                                ? styles.active
                                : ""
                        }`}
                        href={`/tienda?page=${page}`}
                    >
                        {page}
                    </Link>
                );
            })}

            {currentPage < totalPages && (
                <Link
                    className={`${styles.link} ${styles.next}`}
                    href={`/tienda?page=${currentPage + 1}`}
                >
                    Siguiente
                </Link>
            )}
        </nav>
    );
}