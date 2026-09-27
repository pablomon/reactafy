import { Money } from "@/types/money";

// Un tramo de la regla de volumen de ADP: "6 a 15 cajas, 900 cada una".
// `to` es null en el último tramo ("16 o más").
export type PriceTier = {
    from: number;
    to: number | null;
    price: Money;
};

export type ProductPrice = {
    // Precio de 1 caja (con el rol del usuario)
    price: Money;
    // Precio del último tramo, si es más barato ("Desde X")
    fromPrice: Money | null;
    // Tramos de la regla de volumen; [] si no tiene (o solo uno)
    tiers: PriceTier[];
};
