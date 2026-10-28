// Número de página de "?page=N": 1 si falta; null si no es un entero
// válido (?page=0, ?page=abc, ?page=2.5), para responder "no encontrada".
export function parsePage(value: string | undefined) {
    if (value === undefined) return 1;
    const page = Number(value);
    return Number.isInteger(page) && page >= 1 ? page : null;
}
