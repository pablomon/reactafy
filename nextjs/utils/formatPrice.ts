import type { Money } from "@/types/money";

export function formatPrice(
    money: Money
) {
    const value =
        Number(money.amount) /
        Math.pow(10, money.minorUnit);

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: money.currency,
    }).format(value);
}