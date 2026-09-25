import CartProvider from "@/app/context/CartContext";
import AuthProvider from "./context/AuthContext";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/cart/CartDrawer";

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
                <CartDrawer />
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}