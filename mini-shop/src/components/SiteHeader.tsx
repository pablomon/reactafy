import { Link } from 'react-router'
import styles from './SiteHeader.module.css'

const AVISO =
  'ENTREGA GRATIS CON PEDIDO MÍNIMO $1200 EN CDMX Y ALREDEDORES · ' +
  'LLÁMANOS: 5555379880 · WHATSAPP: 5542406506'

export function SiteHeader() {
  return (
    <>
      {/* `aria-hidden` porque el mensaje está duplicado para que el
          bucle no dé un salto: sin esto un lector lo leería dos veces. */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          <span className={styles.tickerItem}>{AVISO}</span>
          <span className={styles.tickerItem}>{AVISO}</span>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.inner}>

          <div className={styles.burger}>
            <button type="button" className={styles.iconButton} aria-label="Abrir menú">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <button type="button" className={styles.iconButton} aria-label="Buscar">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>

          <Link to="/" className={styles.logo}>
            <svg className={styles.logoMark} viewBox="0 0 40 40" aria-hidden="true">
              <defs>
                <linearGradient id="gotaGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5ec8f5" />
                  <stop offset="100%" stopColor="#1f6fd0" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="19" fill="none" stroke="url(#gotaGrad)" strokeWidth="2.5" />
              <path
                d="M20 9c-4 5-7 8.5-7 12a7 7 0 0 0 14 0c0-3.5-3-7-7-12Z"
                fill="url(#gotaGrad)"
              />
            </svg>

            <span>
              Agua<span className={styles.logoAccent}>fy</span>
            </span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/tienda" className={styles.navLink}>Tienda</Link>
            <a href="#somos" className={styles.navLink}>Somos</a>
            <a href="#contacto" className={styles.navLink}>Contacto</a>
            <a href="#blog" className={styles.navLink}>Blog</a>

            <button type="button" className={styles.search}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Buscar
            </button>
          </nav>

          <div className={styles.actions}>
            <button type="button" className={styles.iconButton} aria-label="Mi cuenta">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8Z" />
              </svg>
            </button>

            <button type="button" className={styles.iconButton} aria-label="Carrito, 0 productos">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className={styles.badge}>0</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
