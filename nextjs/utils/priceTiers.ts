import type { Money } from "@/types/money";
import type { PriceTier } from "@/types/productPrice";
import { moneyToNumber } from "@/utils/money";

// % que se ahorra pagando `price` en lugar de `base`: 1000 → 800 = 20
export function savingPercent(base: Money, price: Money): number {
    const baseValue = moneyToNumber(base);
    if (baseValue <= 0) return 0;

    return Math.round((1 - moneyToNumber(price) / baseValue) * 100);
}

// Máximo ahorro de la tabla: último tramo frente al primero
export function maxTierSaving(tiers: PriceTier[]): number {
    if (tiers.length < 2) return 0;

    return savingPercent(tiers[0].price, tiers[tiers.length - 1].price);
}

// "1 – 5", "16 o más", "6" (tramo de una sola cantidad)
export function tierLabel(tier: PriceTier): string {
    if (tier.to === null) return `${tier.from} o más`;
    if (tier.to === tier.from) return String(tier.from);

    return `${tier.from} – ${tier.to}`;
}
