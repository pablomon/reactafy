import type { Metadata } from "next";

import CartProvider from "@/app/context/CartContext";
import AuthProvider from "./context/AuthContext";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingContact from "@/components/FloatingContact";
import { siteConfig } from "@/config/site";
import { StoreProvider } from "@/app/context/StoreContext";
import { getStore } from "@/services/storeService";

// Base para las URLs relativas de los metadatos (canonical, imágenes OG):
// "/producto/x/y" → "https://aguafy.com/producto/x/y".
export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.SITE_URL),
};

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    // Ajustes de la tienda (Woo). El header y el pie hacen la misma
    // petición: Next la memoiza y solo sale una.
    const store = await getStore();

    return (
        <html lang="es">
        <body>
        <StoreProvider value={store}>
        <AuthProvider>
            <CartProvider>
                <Header />
                {children}
                <Footer />
                <CartDrawer />
                <FloatingContact store={store} />
            </CartProvider>
        </AuthProvider>
        </StoreProvider>
        </body>
        </html>
    );
}