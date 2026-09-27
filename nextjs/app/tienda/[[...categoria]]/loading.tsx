import GridSkeleton from "@/components/skeletons/GridSkeleton";
import styles from "./page.module.css";

// Next envuelve la página en <Suspense fallback={<Loading />}>:
// se ve al instante al navegar, y el prefetch de <Link> se para aquí
// (no llama a WordPress).
export default function Loading() {
    return (
        <main className={styles.main}>
            <GridSkeleton />
        </main>
    );
}
