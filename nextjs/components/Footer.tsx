import styles from './SiteFooter.module.css'

const AYUDA = [
  'Contacto',
  'Preguntas frecuentes',
  'Nuestras Rutas',
]

const LEGAL = [
  'Política de privacidad',
  'Política de devolución',
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.features}>
          <div>
            <h2 className={styles.featureTitle}>Reparto especializado</h2>
            <p className={styles.featureText}>
              Rutas semanales por todo CDMX y alrededores.
            </p>
          </div>

          <div>
            <h2 className={styles.featureTitle}>Trato directo y personalizado</h2>
            <p className={styles.featureText}>
              Contacta con nuestro equipo y pregúntanos lo que necesites.
            </p>
          </div>

          <div>
            <h2 className={styles.featureTitle}>Los mejores proveedores</h2>
            <p className={styles.featureText}>
              Distintivo platino y círculo de proveedores.
            </p>
          </div>
        </div>

        <div className={styles.columns}>
          <p className={styles.columnTitle}>¿Necesitas ayuda?</p>

          <div>
            <h3 className={styles.columnHeading}>Atención</h3>
            <div className={styles.list}>
              {AYUDA.map((item) => (
                <a key={item} href="#ayuda" className={styles.link}>
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={styles.columnHeading}>Legal</h3>
            <div className={styles.list}>
              {LEGAL.map((item) => (
                <a key={item} href="#legal" className={styles.link}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.legal}>
          <span>2025 © AGUAFY. TODOS LOS DERECHOS RESERVADOS</span>

          <div className={styles.social}>
            <a href="#facebook" className={styles.socialLink} aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M13 22v-9h3l.5-3.5H13V7.3c0-1 .3-1.7 1.7-1.7H17V2.4A24 24 0 0 0 14.6 2C12 2 10 3.6 10 6.9v2.6H7V13h3v9h3Z" />
              </svg>
            </a>

            <a href="#instagram" className={styles.socialLink} aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>

            <a href="#whatsapp" className={styles.socialLink} aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .9 1.8 1.1 2 1.3.3.1.4 0 .6-.1l.8-.9c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3v1.3Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
