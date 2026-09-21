import { siteConfig } from "@/config/site";

// Next la incrusta al compilar, así que cambiarla exige un build nuevo.
const url = siteConfig.WORDPRESS_URL;

// Sin valor por defecto a propósito: si falta la variable en
// producción, es mejor fallar en el acto que acabar hablando con
// staging sin que nadie se entere.
if (!url) {
    throw new Error(
        "Falta NEXT_PUBLIC_WORDPRESS_URL (ver .env.example)"
    );
}
