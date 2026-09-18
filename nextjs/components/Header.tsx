import Link from "next/link";
import styles from "./Header.module.css";
import AuthTest from "./test/AuthTest";

export default function Header() {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <p>Reactafy</p>
                <Link href="/">
                    Inicio
                </Link>

                <Link href="/tienda">
                    Tienda
                </Link>

                <Link href="/carrito">
                    Carrito
                </Link>

                <Link href="/login">
                    Login
                </Link>

                <AuthTest />
            </nav>
        </header>
    );
}