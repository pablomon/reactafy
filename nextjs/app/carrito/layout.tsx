import type { Metadata } from "next";

// El carrito es una página "use client" y un componente de cliente no puede
// exportar metadata, así que el noindex vive en este layout. Sin él, el día
// que el sitio sea indexable (SITE_URL = aguafy.com) Google podría indexar
// el carrito, que está enlazado desde la cabecera.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function CarritoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
