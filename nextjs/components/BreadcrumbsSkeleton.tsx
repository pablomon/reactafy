import SkeletonText from "@/components/skeletons/SkeletonText";
import styles from "./Breadcrumbs.module.css";

// Mismas clases que <Breadcrumbs>: mismo margen, misma altura y hasta
// el separador "›" (lo pone el CSS entre elementos).
export default function BreadcrumbsSkeleton({ items = 3 }: { items?: number }) {
    return (
        <div className={styles.breadcrumbs} aria-hidden="true">
            <ol className={styles.list}>
                {Array.from({ length: items }, (_, index) => (
                    <li key={index} className={styles.item}>
                        <SkeletonText width={index === items - 1 ? "12em" : "4em"} />
                    </li>
                ))}
            </ol>
        </div>
    );
}
