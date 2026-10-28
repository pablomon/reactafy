import type { CSSProperties } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";

import type { Banner } from "@/types/banner";
import { resolveLink } from "@/utils/sitePath";
import BannerTrack from "./BannerTrack";
import styles from "./BannerCarousel.module.css";

// Por si WordPress solo conoce la dirección de una imagen y no su tamaño
const FALLBACK_DESKTOP = { width: 2400, height: 1000 };
const FALLBACK_MOBILE = { width: 750, height: 600 };

// Desde este ancho se usa la imagen de escritorio.
// Tiene que coincidir con el @media de BannerCarousel.module.css.
const DESKTOP_MEDIA = "(min-width: 768px)";
const SIZES = "(min-width: 1280px) 1280px, 100vw";

function BannerSlide({ banner, first }: { banner: Banner; first: boolean }) {
    const desktop = {
        width: banner.desktop.width ?? FALLBACK_DESKTOP.width,
        height: banner.desktop.height ?? FALLBACK_DESKTOP.height,
    };

    // Sin imagen de móvil propia, el móvil usa la de escritorio
    const mobileImage = banner.mobile ?? banner.desktop;
    const mobile = banner.mobile
        ? {
            width: banner.mobile.width ?? FALLBACK_MOBILE.width,
            height: banner.mobile.height ?? FALLBACK_MOBILE.height,
        }
        : desktop;

    const alt = banner.desktop.alt || banner.title;

    // Solo el primer banner se ve al cargar la página, así que solo ese se
    // pide con prioridad. Los demás esperan a que haga falta.
    const priority = first
        ? { loading: "eager" as const, fetchPriority: "high" as const }
        : {};

    const { props: desktopProps } = getImageProps({
        alt,
        src: banner.desktop.url,
        sizes: SIZES,
        ...desktop,
    });

    const { props: mobileProps } = getImageProps({
        alt,
        src: mobileImage.url,
        sizes: SIZES,
        ...mobile,
        ...priority,
    });

    // El navegador elige: si la pantalla es ancha usa <source>; si no, la
    // imagen de móvil. Solo descarga UNA de las dos.
    const picture = (
        <picture>
            <source media={DESKTOP_MEDIA} srcSet={desktopProps.srcSet} sizes={SIZES} />
            <img {...mobileProps} alt={alt} className={styles.image} />
        </picture>
    );

    const target = resolveLink(banner.link);

    // La forma del hueco sale del tamaño real de las imágenes: así la
    // página no da saltos mientras carga.
    const slideStyle = {
        "--ratio-mobile": `${mobile.width} / ${mobile.height}`,
        "--ratio-desktop": `${desktop.width} / ${desktop.height}`,
    } as CSSProperties;

    return (
        <li className={styles.slide} style={slideStyle}>
            {!target ? (
                picture
            ) : target.external ? (
                <a href={target.href} rel="noopener" className={styles.link}>
                    {picture}
                </a>
            ) : (
                <Link href={target.href} className={styles.link}>
                    {picture}
                </Link>
            )}
        </li>
    );
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
    if (banners.length === 0) {
        return null;
    }

    return (
        <section
            className={styles.carousel}
            aria-roledescription="carousel"
            aria-label="Promociones"
        >
            <BannerTrack count={banners.length}>
                {banners.map((banner, index) => (
                    <BannerSlide key={banner.id} banner={banner} first={index === 0} />
                ))}
            </BannerTrack>
        </section>
    );
}
