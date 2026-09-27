import price from "@/components/Price.module.css";
import product from "@/components/product/Product.module.css";
import page from "@/components/product/ProductPage.module.css";
import SkeletonPill from "./SkeletonPill";
import SkeletonText from "./SkeletonText";
import styles from "./Skeleton.module.css";

// La franja azul de la ficha con las MISMAS clases que la página
// (hero, heroInner, media, content…): mismas columnas, márgenes y
// alturas de línea. Solo cambia el contenido por bloques grises.
export default function ProductHeroSkeleton() {
    return (
        <section className={page.hero} aria-hidden="true">
            <div className={`${page.container} ${page.heroInner}`}>
                <div className={page.media}>
                    <div className={`${styles.block} ${styles.image}`} />
                    <p className={page.sku}>
                        <SkeletonText width="8em" />
                    </p>
                </div>

                <div className={page.content}>
                    <div className={page.info}>
                        <p className={page.category}><SkeletonText width="7em" /></p>
                        <p className={page.title}><SkeletonText width="8em" /></p>
                        <p className={page.format}><SkeletonText width="11em" /></p>
                        <p className={price.price}><SkeletonText width="5em" /></p>
                        <p className={price.tax}><SkeletonText width="5em" /></p>
                        <span className={page.brand}><SkeletonText width="7em" /></span>
                    </div>

                    <div className={product.selectors}>
                        <div>
                            <p className={product.selectorLabel}><SkeletonText width="10em" /></p>
                            <div className={product.selectorOptions}>
                                <SkeletonPill width={64} height={25} />
                                <SkeletonPill width={64} height={25} />
                                <SkeletonPill width={64} height={25} />
                            </div>
                        </div>
                    </div>

                    <div className={page.buy}>
                        <div className={product.addForm}>
                            <SkeletonPill width={130} height={38} />
                            <SkeletonPill width={220} height={42} />
                        </div>
                    </div>

                    <div className={page.notesRow}>
                        <ul className={product.notes}>
                            <li className={product.note}><SkeletonText width="22em" /></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
