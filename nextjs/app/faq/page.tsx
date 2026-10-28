import type { Metadata } from "next";

import Tabs from "@/components/Tabs";
import { getStore } from "@/services/storeService";
import { moneyToNumber } from "@/utils/money";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Preguntas frecuentes - Aguafy",
    description:
        "Políticas de devolución, privacidad y entrega, métodos de pago, facturación y respuestas a las preguntas más frecuentes de Aguafy.",
    alternates: { canonical: "/faq/" },
};

export default async function FaqPage() {
    // El monto mínimo sale de los ajustes de la tienda en WordPress, los
    // mismos que usa el carrito: si cambia allí, cambia aquí.
    const store = await getStore();
    const minOrder = new Intl.NumberFormat("es-MX").format(moneyToNumber(store.minOrder));

    const questions = [
        {
            question: "¿Cuál es el monto mínimo para hacer pedidos?",
            answer: <p>El monto mínimo de compra es de ${minOrder} MXN por pedido.</p>,
        },
        {
            question: "¿Qué día y a qué hora entregan el pedido?",
            answer: (
                <p>
                    La entrega depende de la zona. Te invitamos a consultar nuestras
                    rutas para conocer días y horarios disponibles.
                </p>
            ),
        },
        {
            question: "¿Hacen entregas a otros estados?",
            answer: (
                <p>
                    Sí, pero es necesario que nos llames al número que aparece en la
                    página para coordinar y confirmar la entrega.
                </p>
            ),
        },
        {
            question: "¿Qué cuenta uso para pagar por transferencia?",
            answer: (
                <>
                    <p>El número de cuenta donde depositar el importe es:</p>
                    <p>
                        Banco BBVA
                        <br />
                        N.º de Cuenta 0181219448
                        <br />
                        N.º Cuenta CLABE 012180001812194480
                    </p>
                    <p>Debe indicar en el concepto el número de pedido.</p>
                </>
            ),
        },
        {
            question: "¿Existen descuentos adicionales para compras mayores?",
            answer: (
                <p>
                    Sí, para compras de volumen podemos ofrecer opciones especiales. Por
                    favor contáctanos por teléfono para más detalles.
                </p>
            ),
        },
    ];

    const tabs = [
        {
            id: "politica-de-devolucion",
            label: "Política de devolución",
            content: (
                <>
                    <h2>Política de devolución</h2>
                    <p>
                        Hacemos reposición de producto que al momento de ser entregado,
                        presente algún daño: cajas rotas, abiertas o con botellas
                        faltantes. En ese caso es imprescindible que el cliente notifique
                        al chofer y que la incidencia quede registrada en el recibo de
                        entrega.
                        <br />
                        En el caso en que el cliente reciba un producto que no haya
                        pedido, se hará la recolección de la mercancía y esta debe estar
                        en perfectas condiciones, caja cerrada. En los dos casos la
                        reposición de producto se realizará en un plazo no mayor a una
                        semana a partir de la entrega de producto.
                    </p>
                </>
            ),
        },
        {
            id: "politica-de-privacidad",
            label: "Política de privacidad",
            content: (
                <>
                    <h2>Política de privacidad</h2>
                    <p>
                        <strong>Quiénes somos</strong>
                        <br />
                        La dirección de nuestra web es: https://aguafy.com, nuestra razón
                        social es Exclusivas Faro SA de CV, calle Abel 59 int 16 ,cp.
                        07840, colonia Guadalupe Tepeyac, delegación Gustavo A. Madero,
                        Ciudad de México, teléfono de contacto 55 5537 9880.
                    </p>
                    <p>
                        <strong>Qué datos personales recogemos y por qué los recogemos</strong>
                        <br />
                        <strong>Cookies</strong>
                        <br />
                        Si dejas un comentario en nuestro sitio puedes elegir guardar tu
                        nombre, dirección de correo electrónico y web en cookies. Esto es
                        para tu comodidad, para que no tengas que volver a rellenar tus
                        datos cuando dejes otro comentario. Estas cookies tendrán una
                        duración de un año.
                    </p>
                    <p>
                        Si tienes una cuenta y te conectas a este sitio, instalaremos una
                        cookie temporal para determinar si tu navegador acepta cookies.
                        Esta cookie no contiene datos personales y se elimina al cerrar el
                        navegador.
                    </p>
                    <p>
                        Cuando accedas, también instalaremos varias cookies para guardar
                        tu información de acceso y tus opciones de visualización de
                        pantalla. Las cookies de acceso duran dos días, y las cookies de
                        opciones de pantalla duran un año. Si seleccionas «Recuérdame», tu
                        acceso perdurará durante dos semanas. Si sales de tu cuenta, las
                        cookies de acceso se eliminarán.
                    </p>
                    <p>
                        <strong>Con quién compartimos tus datos</strong>
                        <br />
                        Si solicitas un restablecimiento de contraseña, tu dirección IP
                        será incluida en el correo electrónico de restablecimiento.
                    </p>
                    <p>
                        <strong>Cuánto tiempo conservamos tus datos</strong>
                        <br />
                        Si dejas un comentario, el comentario y sus metadatos se conservan
                        indefinidamente. Esto es para que podamos reconocer y aprobar
                        comentarios sucesivos automáticamente, en lugar de mantenerlos en
                        una cola de moderación.
                    </p>
                    <p>
                        De los usuarios que se registran en nuestra web, también
                        almacenamos la información personal que proporcionan en su perfil
                        de usuario. Todos los usuarios pueden ver, editar o eliminar su
                        información personal en cualquier momento (excepto que no pueden
                        cambiar su nombre de usuario). Los administradores de la web
                        también pueden ver y editar esa información.
                    </p>
                    <p>
                        <strong>Qué derechos tienes sobre tus datos</strong>
                        <br />
                        Si tienes una cuenta o has dejado comentarios en esta web, puedes
                        solicitar recibir un archivo de exportación de los datos
                        personales que tenemos sobre ti, incluyendo cualquier dato que nos
                        hayas proporcionado. También puedes solicitar que eliminemos
                        cualquier dato personal que tengamos sobre ti. Esto no incluye
                        ningún dato que estemos obligados a conservar con fines
                        administrativos, legales o de seguridad.
                    </p>
                    <p>
                        <strong>Dónde enviamos tus datos</strong>
                        <br />
                        Los comentarios de los visitantes puede que los revise un servicio
                        de detección automática de spam.
                    </p>
                </>
            ),
        },
        {
            id: "politica-de-entrega",
            label: "Política de entrega",
            content: (
                <>
                    <h2>Política de entrega</h2>
                    <p>
                        1. Pedidos mayores a 70 cajas se entregan en un promedio de 24 a
                        72 horas. Aplica restricciones*
                    </p>
                    <p>
                        2. Pedidos menores a 70 cajas se entregan en las rutas semanales
                        (ver tabla de rutas)
                    </p>
                    <p>
                        3. Si tu ubicación no se encuentra dentro de las rutas
                        establecidas, por favor comunícate con nuestras oficinas antes de
                        realizar tu pedido.
                    </p>
                    <p>
                        *Restricciones: las entregas se realizan en la Ciudad de México y
                        parte del Estado de México, para entregas en otras partes de la
                        república por favor comunicarse con nuestro equipo de ventas.
                        Estas entregas se hacen a través de una paquetería externa.
                    </p>
                </>
            ),
        },
        {
            id: "metodos-de-pago",
            label: "Métodos de pago",
            content: (
                <>
                    <h2>Métodos de pago</h2>
                    <p>
                        ✔ Tarjeta de crédito y débito (Visa, Mastercard, etc.)
                        <br />✔ Transferencia bancaria
                        <br />✔ Pago contra reembolso (en efectivo al momento de la
                        entrega, solo en zonas seleccionadas)
                    </p>
                    <p>✔ Otros métodos (consultar disponibilidad)</p>
                </>
            ),
        },
        {
            id: "facturacion",
            label: "Facturación",
            content: (
                <>
                    <h2>Facturación</h2>
                    <p>
                        Puedes solicitar factura al realizar tu pedido en Aguafy.com,
                        proporcionando tus datos fiscales.
                    </p>
                </>
            ),
        },
        {
            id: "preguntas-frecuentes",
            label: "Preguntas frecuentes",
            content: (
                <div className={styles.questions}>
                    {questions.map((item) => (
                        <details key={item.question} className={styles.question}>
                            <summary>{item.question}</summary>
                            <div className={styles.answer}>{item.answer}</div>
                        </details>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <main className={styles.page}>
            <h1>INFO</h1>
            <Tabs tabs={tabs} />
        </main>
    );
}
