import product from "@/components/product/Product.module.css";
import SkeletonCards from "./SkeletonCards";
import SkeletonText from "./SkeletonText";

// "Te puede interesar": el título y la misma pista del carrusel, así las
// tarjetas vacías tienen el ancho de las reales (2 / 3 / 4 por fila).
export default function ProductCarouselSkeleton() {
    return (
        <section className={product.carousel} aria-hidden="true">
            <p className={product.carouselTitle}>
                <SkeletonText width="9em" />
            </p>

            <div className={product.carouselTrack}>
                <SkeletonCards count={4} />
            </div>
        </section>
    );
}
