import type { Metadata } from "next";

import CartProvider from "@/app/context/CartContext";
import AuthProvider from "./context/AuthContext";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { siteConfig } from "@/config/site";

// Base para las URLs relativas de los metadatos (canonical, imágenes OG):
// "/producto/x/y" → "https://aguafy.com/producto/x/y".
export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.SITE_URL),
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
        <body>
        <AuthProvider>
            <CartProvider>
                <Header />
                {children}
                <Footer />
                <CartDrawer />
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}