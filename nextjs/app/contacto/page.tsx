import type { Metadata } from "next";
import Image from "next/image";

import { getStore } from "@/services/storeService";
import styles from "./page.module.css";

import photo from "./images/contacto.webp";

export const metadata: Metadata = {
    title: "Contacto - Aguafy",
    description:
        "Contacta con Aguafy por WhatsApp, teléfono o correo. Lunes a viernes de 09:00 a 18:00 y sábados de 10:00 a 13:00. Gustavo A. Madero, CDMX.",
    alternates: { canonical: "/contacto/" },
};

// El horario aparece dos veces (WhatsApp y teléfono)
const HOURS = (
    <>
        De lunes a viernes, de 09:00 a 18:00.
        <br />
        Sábados, de 10:00 a 13:00.
    </>
);

const MAPS_URL =
    "https://www.google.com/maps/place/Aguafy/@19.4623284,-99.1258038,17z/data=!3m1!4b1!4m6!3m5!1s0x85d1f96ca0db4e8d:0x2ac58458c8db7775!8m2!3d19.4623234!4d-99.1232235!16s%2Fg%2F1tfwkpyv?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";

export default async function ContactoPage() {
    // El teléfono y el WhatsApp salen de los ajustes de la tienda en
    // WordPress, los mismos que usa la cabecera: se cambian en un solo sitio.
    const store = await getStore();

    return (
        <main className={styles.page}>
            <div className={styles.info}>
                <h1>Contacta con nosotros</h1>

                {store.whatsappUrl && (
                    <section className={styles.block}>
                        <h2>Whatsapp</h2>
                        <p>{HOURS}</p>
                        <a href={store.whatsappUrl} className={styles.button}>
                            Iniciar whatsapp
                        </a>
                        <p className={styles.note}>
                            Al utilizar WhatsApp, confirmas que has leído y entiendes
                            nuestra Política de Privacidad.
                        </p>
                    </section>
                )}

                {store.phone && (
                    <section className={styles.block}>
                        <h2>Teléfono</h2>
                        <p>{HOURS}</p>
                        <a href={`tel:${store.phone}`} className={styles.button}>
                            tel {store.phone}
                        </a>
                    </section>
                )}

                <section className={styles.block}>
                    <h2>Mail</h2>
                    <p>
                        Recibirás un mail con nuestra respuesta. ¡Intentaremos ayudarte
                        lo antes posible!
                    </p>
                    <a href="mailto:contacto@aguafy.com" className={styles.button}>
                        contacto@aguafy.com
                    </a>
                </section>

                <section className={styles.block}>
                    <h2>Dirección</h2>
                    <p>
                        Calle fc industrial 47, cp. 07840, colonia 7 de noviembre,
                        alcaldia Gustavo A. Madero, CDMX
                    </p>
                    <a href={MAPS_URL} className={styles.button} rel="noopener">
                        Ubícanos
                    </a>
                </section>
            </div>

            <Image
                src={photo}
                alt="Agua cayendo en un vaso"
                className={styles.photo}
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
            />
        </main>
    );
}
