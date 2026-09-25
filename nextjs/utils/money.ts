import type { Money } from "@/types/money";

// Woo manda los importes en unidades mínimas y como texto:
// { amount: "135854", minorUnit: 2 } → 1358.54
export function moneyToNumber(money: Money): number {
    return Number(money.amount) / 10 ** money.minorUnit;
}

// Lo contrario, con la moneda y los decimales de `like`:
// 841.46 → { amount: "84146", currency: "MXN", minorUnit: 2 }
export function numberToMoney(value: number, like: Money): Money {
    return {
        ...like,
        amount: String(Math.round(value * 10 ** like.minorUnit)),
    };
}
