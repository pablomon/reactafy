import Link from "next/link";
import Image from "next/image";

import styles from "./Header.module.css";
import { siteConfig } from "@/config/site";
import { getBrands } from "@/services/productService";
import { getStore } from "@/services/storeService";
import type { Store } from "@/types/store";
import { moneyToNumber } from "@/utils/money";
import HeaderAccount from "./HeaderAccount";
import HeaderCart from "./HeaderCart";
import HeaderNav from "./HeaderNav";
import MobileMenu, { type HeaderMenuItem } from "./MobileMenu";
import SearchPanel from "./SearchPanel";

const MENU: HeaderMenuItem[] = [
    { label: "Tienda", href: "/tienda", highlight: true },
    { label: "Somos", href: "/about" },
    { label: "Contacto", href: "/contacto" },
    { label: "Blog", href: "/blog" },
];

// Un bloque de mensajes. Se pinta dos veces seguidas y se desplaza
// un 50 %: cuando el primero sale, el segundo ocupa su sitio y el
// bucle no tiene salto.
function MarqueeBlock(props: { store: Store; hidden?: boolean }) {
    const { phone, whatsapp, whatsappUrl, callingCode } = props.store;

    const minOrder = new Intl.NumberFormat("es-MX", {
        maximumFractionDigits: 0,
        useGrouping: false, // "$1200", como en aguafy.com
    }).format(moneyToNumber(props.store.minOrder));

    const messages = [0, 1, 2].map((i) => (
        <span key={i}>
            · LLÁMANOS: <a href={`tel:${callingCode}${phone}`}>{phone}</a>
            {" "}· WHATSAPP: <a href={whatsappUrl}>{whatsapp}</a>
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

export default async function Header() {
    // En paralelo: el header no tarda más por pedir también las marcas.
    // Si fallan las marcas, la web sigue funcionando (panel vacío).
    const [store, brands] = await Promise.all([
        getStore(),
        getBrands().catch(() => []),
    ]);

    return (
        <header className={styles.header}>
            <div className={styles.marquee}>
                <div className={styles.marqueeTrack}>
                    <MarqueeBlock store={store} />
                    <MarqueeBlock store={store} hidden />
                </div>
            </div>

            <div className={styles.bar}>
                <div className={styles.mobileLeft}>
                    <MobileMenu items={MENU} />
                    <SearchPanel
                        brands={brands}
                        triggerClassName={styles.iconButtonReset}
                        triggerLabel="Buscar"
                    >
                        <SearchIcon />
                    </SearchPanel>
                </div>

                <Link href="/" className={styles.logo}>
                    <Image
                        src={siteConfig.LOGO_URL}
                        alt="Aguafy - Tu distribuidor de bebidas"
                        width={170}
                        height={45}
                        priority
                    />
                </Link>

                <nav className={styles.nav} aria-label="Principal">
                    <HeaderNav items={MENU} />

                    <SearchPanel brands={brands} triggerClassName={styles.searchButton}>
                        <SearchIcon />
                        Buscar
                    </SearchPanel>
                </nav>

                <div className={styles.actions}>
                    <HeaderAccount />
                    <HeaderCart />
                </div>
            </div>
        </header>
    );
}
