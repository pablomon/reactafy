import Link from "next/link";
import Image from "next/image";

import styles from "./Header.module.css";
import { siteConfig } from "@/config/site";
import HeaderAccount from "./HeaderAccount";
import HeaderCart from "./HeaderCart";
import HeaderNav from "./HeaderNav";
import MobileMenu, { type HeaderMenuItem } from "./MobileMenu";

const MENU: HeaderMenuItem[] = [
    { label: "Tienda", href: "/tienda", highlight: true },
    { label: "Somos", href: "/about" },
    { label: "Contacto", href: "/contacto" },
    { label: "Blog", href: "/blog" },
];

const LOGO_URL = `${siteConfig.WORDPRESS_URL}/wp-content/uploads/2025/03/logo_aguafy_h.webp`;

const { PHONE, WHATSAPP, MIN_ORDER_MXN } = siteConfig.STORE;

const minOrder = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
    useGrouping: false, // "$1200", como en aguafy.com
}).format(MIN_ORDER_MXN);

// Un bloque de mensajes. Se pinta dos veces seguidas y se desplaza
// un 50 %: cuando el primero sale, el segundo ocupa su sitio y el
// bucle no tiene salto.
function MarqueeBlock(props: { hidden?: boolean }) {
    const messages = [0, 1, 2].map((i) => (
        <span key={i}>
            · LLÁMANOS: <a href={`tel:${PHONE}`}>{PHONE}</a>
            {" "}· WHATSAPP: <a href={`https://wa.me/521${WHATSAPP}`}>{WHATSAPP}</a>
            {" "}· ENTREGA GRATIS CON PEDIDO MÍNIMO ${minOrder} EN CDMX Y ALREDEDORES{" "}
        </span>
    ));

    return (
        <div className={styles.marqueeBlock} aria-hidden={props.hidden}>
            {messages}
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14.5 14.5 19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.marquee}>
                <div className={styles.marqueeTrack}>
                    <MarqueeBlock />
                    <MarqueeBlock hidden />
                </div>
            </div>

            <div className={styles.bar}>
                <div className={styles.mobileLeft}>
                    <MobileMenu items={MENU} />
                    <Link href="/tienda" className={styles.iconButton} aria-label="Buscar">
                        <SearchIcon />
                    </Link>
                </div>

                <Link href="/" className={styles.logo}>
                    <Image
                        src={LOGO_URL}
                        alt="Aguafy - Tu distribuidor de bebidas"
                        width={170}
                        height={45}
                        priority
                    />
                </Link>

                <nav className={styles.nav} aria-label="Principal">
                    <HeaderNav items={MENU} />

                    <Link href="/tienda" className={styles.searchButton}>
                        <SearchIcon />
                        Buscar
                    </Link>
                </nav>

                <div className={styles.actions}>
                    <HeaderAccount />
                    <HeaderCart />
                </div>
            </div>
        </header>
    );
}
