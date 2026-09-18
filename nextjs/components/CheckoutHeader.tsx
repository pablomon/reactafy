import Link from "next/link";
import styles from "./Header.module.css";
import AuthTest from "./test/AuthTest";

export default function CheckoutHeader() {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <p>Checkout</p>
                <Link href="/">
                    Inicio
                </Link>

                <Link href="/login">
                    Login
                </Link>

                <AuthTest />
            </nav>
        </header>
    );
}