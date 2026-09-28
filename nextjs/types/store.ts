import type { Money } from "./money";

// Ajustes de la tienda: GET /reactafy/v1/store
// (en WordPress, "Ajustes → Tienda")
export type Store = {
    phone: string;          // "5555379880" (sin prefijo)
    whatsapp: string;       // tal como está en el ajuste, para mostrarlo
    whatsappUrl: string;    // "https://wa.me/525542406506" ("" si no hay)
    callingCode: string;    // "+52" (país de la tienda en Woo)
    minOrder: Money;
    maxOrder: Money | null; // null = sin máximo
    maxItems: number;
    // Zona horaria de WordPress ("America/Mexico_City"): para mostrar fechas
    timezone: string;
};
