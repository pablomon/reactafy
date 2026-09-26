// La URL pública de una página de marca: /brand/{slug}/
// Único sitio donde se construye (tarjetas, migas de pan, canonical…).
export function brandPath(slug: string): string {
    return `/brand/${slug}/`;
}
