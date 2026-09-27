import BreadcrumbsSkeleton from "@/components/BreadcrumbsSkeleton";
import page from "@/components/product/ProductPage.module.css";
import ProductCarouselSkeleton from "@/components/skeletons/ProductCarouselSkeleton";
import ProductHeroSkeleton from "@/components/skeletons/ProductHeroSkeleton";
import ProductTabsSkeleton from "@/components/skeletons/ProductTabsSkeleton";
import skeleton from "@/components/skeletons/Skeleton.module.css";

// ¿Por qué aquí y no dentro de [group]/[[...product]]/?
// El <Suspense> de un loading.tsx envuelve a la carpeta HIJA y se
// identifica por los params de esa hija. Aquí la hija es [group]:
//  - Otro producto del MISMO grupo (selectores): [group] no cambia, el
//    Suspense es el mismo y ya estaba visible → React deja la página
//    actual en pantalla mientras llega la nueva (no hay esqueleto).
//  - Otro grupo, o llegar desde la tienda: [group] cambia → Suspense
//    nuevo → se ve este esqueleto.
//
// El esqueleto se monta con una pieza por componente, colocadas con las
// mismas clases que la página, así ocupa lo mismo y nada salta.
export default function Loading() {
    return (
        <main className={page.page} aria-busy="true">
            <span className={skeleton.srOnly}>Cargando producto…</span>

            <div className={page.container}>
                <BreadcrumbsSkeleton />
            </div>

            <ProductHeroSkeleton />

            <div className={page.container}>
                <ProductTabsSkeleton />
                <ProductCarouselSkeleton />
            </div>
        </main>
    );
}
