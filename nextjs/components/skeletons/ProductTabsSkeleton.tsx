import product from "@/components/product/Product.module.css";
import SkeletonPill from "./SkeletonPill";
import SkeletonText from "./SkeletonText";
import styles from "./Skeleton.module.css";

const LINES = ["100%", "96%", "100%", "90%", "100%", "60%"];

// Pestañas + panel (ficha técnica a la izquierda, texto a la derecha)
export default function ProductTabsSkeleton() {
    return (
        <section className={product.tabs} aria-hidden="true">
            <div className={product.tabList}>
                <SkeletonPill width={120} height={38} />
                <SkeletonPill width={120} height={38} />
                <SkeletonPill width={120} height={38} />
            </div>

            <div className={product.tabPanel}>
                <div className={product.features}>
                    <div
                        className={styles.block}
                        style={{ width: 200, height: 220, flexShrink: 0 }}
                    />

                    <div className={product.richText}>
                        {LINES.map((width, index) => (
                            <p key={index}><SkeletonText width={width} /></p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
