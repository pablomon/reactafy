import GridSkeleton from "@/components/skeletons/GridSkeleton";
import styles from "./page.module.css";

// Ver app/tienda/[[...categoria]]/loading.tsx
export default function Loading() {
    return (
        <main className={styles.main}>
            <GridSkeleton />
        </main>
    );
}
