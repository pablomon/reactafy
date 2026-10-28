import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import AboutTabs from "./AboutTabs";
import styles from "./page.module.css";

import history from "./images/history.webp";
import droplet from "./images/droplet.png";
import map from "./images/map.png";
import box from "./images/package.png";

export const metadata: Metadata = {
    title: "Somos - Aguafy",
    description:
        "Desde 1990, Aguafy es un referente en la distribución de bebidas en el valle de México: agua embotellada, refrescos y bebidas alcohólicas con flota propia.",
    alternates: { canonical: "/about/" },
};

// Los textos de las pestañas. Se escriben aquí, en el código, no en WordPress.
const TABS = [
    {
        label: "Misión",
        content: (
            <p>
                <strong>Distribuimos </strong>agua embotellada de las mejores marcas a
                través de una red propia con servicio a domicilio en Ciudad de México y
                Estado de México para negocios y hogares.
            </p>
        ),
    },
    {
        label: "Visión",
        content: (
            <p>
                <strong>Ser reconocidos</strong> como la distribuidora{" "}
                <strong>N.º 1</strong> de las mejores marcas de agua embotellada en
                México, con excelente servicio a domicilio. Serios, puntuales y
                adaptables a las necesidades de nuestros clientes.
            </p>
        ),
    },
    {
        label: "Valores",
        content: (
            <>
                <p>
                    <strong>Servicio al Cliente</strong> trabajamos constantemente por
                    satisfacer las necesidades de nuestros clientes, somos serios,
                    puntuales y flexibles
                </p>
                <p>
                    <strong>Calidad </strong>aguas nacionales e importación con
                    escrupulosa manipulación desde su origen y elaboración
                </p>
                <p>
                    <strong>Eficiencia </strong>planeamos rutas eficientes para llevar
                    los productos a nuestros clientes
                </p>
                <p>
                    <strong>Accesibilidad </strong>disponemos diversos canales de
                    contacto para cada tipo de cliente y situación en la que requieran
                    nuestro servicio
                </p>
                <p>
                    <strong>Actualidad y Bienestar</strong> nos adaptamos a los cambios
                    promoviendo en la sociedad el consumo de agua
                </p>
            </>
        ),
    },
];

const HIGHLIGHTS = [
    { icon: droplet, text: "Calidad, confianza y servicio personalizado" },
    { icon: map, text: "Cobertura en CDMX y Estado de México" },
    { icon: box, text: "Entrega rápida con flota propia" },
];

export default function AboutPage() {
    return (
        <main className={styles.page}>
            <header className={styles.intro}>
                <h1>Aguafy México: Excelencia en Distribución de bebidas.</h1>
                <p className={styles.tagline}>
                    Desde 1990, nuestra empresa ha sido un referente en la distribución
                    de bebidas en el valle de México.
                </p>
            </header>

            <section className={styles.story}>
                <Image
                    src={history}
                    alt="Un vaso de agua"
                    className={styles.storyImage}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority
                />

                <div className={styles.storyText}>
                    <p>
                        Comenzamos nuestra trayectoria bajo el nombre de{" "}
                        <strong>Exclusivas Faro</strong>, ahora Aguafy, con la misión de
                        ofrecer a nuestros clientes las mejores marcas de bebidas del
                        mercado. Durante más de tres décadas, hemos trabajado con hoteles,
                        restaurantes, empresas, particulares y negocios, consolidándonos
                        como un socio confiable en el suministro de bebidas de alta
                        calidad.
                    </p>
                    <p>
                        <strong>Servicios</strong>
                        <br />
                        Nos especializamos en la distribución de agua embotellada premium
                        y estándar, así como refrescos y bebidas alcohólicas, garantizando
                        la calidad en cada entrega. Trabajamos con las mejores marcas del
                        mercado, ofreciendo diferentes presentaciones para adaptarnos a
                        las necesidades de cada cliente.
                        <br />
                        Operamos en <strong>Ciudad de México y Estado de México</strong>,
                        con una flota propia que nos permite realizar entregas rápidas y
                        eficientes dentro de nuestra área de cobertura y nos apoyamos en
                        paqueterías aliadas para envíos en todo el país.
                        <br />
                        En Aguafy, priorizamos la excelencia en el trato con el cliente,
                        la eficiencia en la distribución y el compromiso con la
                        sostenibilidad. Más de <strong>30 años de experiencia</strong> nos
                        respaldan como un referente en el sector.
                    </p>
                    <Link href="/tienda/" className={styles.button}>
                        Ir a la tienda
                    </Link>
                </div>
            </section>

            <AboutTabs tabs={TABS} />

            <ul className={styles.highlights}>
                {HIGHLIGHTS.map((item) => (
                    <li key={item.text} className={styles.card}>
                        <Image src={item.icon} alt="" width={64} height={64} />
                        <p>{item.text}</p>
                    </li>
                ))}
            </ul>

            <div className={styles.cta}>
                <Link href="/tienda/" className={styles.button}>
                    Ir a la tienda
                </Link>
            </div>
        </main>
    );
}
