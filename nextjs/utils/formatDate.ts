// Fecha de WordPress (ISO 8601, en UTC) → texto en español en la zona
// horaria de la tienda: "25 de septiembre de 2026".
// timeZone sale de /store (Ajustes → Generales → Zona horaria), no se
// escribe aquí. Si WordPress tuviera un valor que el navegador no
// entiende, se usa UTC antes que romper la página.
export function formatDate(
    iso: string | null,
    timeZone: string,
    withTime = false
): string {
    if (!iso) return "";

    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    };

    try {
        return new Intl.DateTimeFormat("es-MX", { ...options, timeZone }).format(new Date(iso));
    } catch {
        return new Intl.DateTimeFormat("es-MX", { ...options, timeZone: "UTC" }).format(new Date(iso));
    }
}
