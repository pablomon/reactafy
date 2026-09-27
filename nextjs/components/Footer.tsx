import Link from "next/link";

import { siteConfig } from "@/config/site";
import { getStore } from "@/services/storeService";
import styles from "./Footer.module.css";

const { FACEBOOK, INSTAGRAM } = siteConfig.SOCIAL;

// Bloques de valor (copiados del pie de aguafy.com).
// Provisional: más adelante, del mismo menú de WordPress que el header.
const VALUE_BLOCKS = [
    { title: "Reparto especializado", cta: "Contacta con nosotros", href: "/contacto/" },
    { title: "Rutas semanales por todo CDMX", cta: "Contacta a nuestro equipo", href: "/contacto/" },
    { title: "Trato directo y personalizado", cta: "Pregúntanos", href: "/contacto/" },
    { title: "Los mejores proveedores", cta: "Ver todo el producto", href: "/tienda/" },
];

// Páginas de WordPress: <a> normales (no <Link>). Cuando Reactafy esté en
// aguafy.com, WordPress las servirá en estas mismas rutas.
const HELP_LINKS = [
    { label: "Contacto", href: "/contacto/" },
    { label: "Preguntas frecuentes", href: "/faq/" },
    { label: "Política de privacidad", href: "/faq/" },
    { label: "Política de devolución", href: "/faq/" },
];

// Pie provisional. Server Component: sin estado ni JavaScript.
export default async function Footer() {
    // Misma petición que el layout y el header: Next la memoiza
    const { phone, whatsappUrl, callingCode } = await getStore();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <ul className={styles.values}>
                    {VALUE_BLOCKS.map((block) => (
                        <li key={block.title} className={styles.value}>
                            <p className={styles.valueTitle}>{block.title}</p>
                            {block.href === "/tienda/" ? (
                                <Link href={block.href} className={styles.valueLink}>
                                    {block.cta}
                                </Link>
                            ) : (
                                <a href={block.href} className={styles.valueLink}>
                                    {block.cta}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>

                <nav className={styles.help} aria-label="Ayuda">
                    <p className={styles.helpTitle}>¿Necesitas ayuda?</p>
                    <ul className={styles.helpLinks}>
                        {HELP_LINKS.map((link) => (
                            <li key={link.label}>
                                <a href={link.href} className={styles.helpLink}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.bottom}>
                    <p className={styles.copy}>
                        {new Date().getFullYear()} © Aguafy. Todos los derechos reservados
                    </p>

                    <ul className={styles.social} aria-label="Redes sociales y contacto">
                        <li>
                            <a href={FACEBOOK} aria-label="Facebook" className={styles.icon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9H17l.5-4h-4V8.8c0-.5.2-.8.5-.8Z" />
                                </svg>
                            </a>
                        </li>
                        <li>
                            <a href={INSTAGRAM} aria-label="Instagram" className={styles.icon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="3" y="3" width="18" height="18" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                        </li>
                        <li>
                            <a href={whatsappUrl} aria-label="WhatsApp" className={styles.icon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
                                </svg>
                            </a>
                        </li>
                        <li>
                            <a href={`tel:${callingCode}${phone}`} aria-label={`Llamar al ${phone}`} className={styles.icon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
