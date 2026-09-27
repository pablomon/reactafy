import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
import styles from "./page.module.css";

// Ver app/tienda/[[...categoria]]/loading.tsx
export default function Loading() {
    return (
        <main className={styles.container}>
            <ProductSkeleton />
        </main>
    );
}
