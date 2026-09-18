import AuthProvider from "./auth/AuthContext";
import CartProvider from "./carrito/CartContext";
import "./globals.css";
import Header from "@/components/Header";

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
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}