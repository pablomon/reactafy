import AuthProvider from "./auth/AuthContext";
import CartProvider from "./carrito/CartContext";
import "./globals.css";

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
                {children}
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}