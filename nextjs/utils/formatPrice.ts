import type { Money } from "@/types/money";
import { moneyToNumber } from "@/utils/money";

export function formatPrice(money: Money) {

    const value = moneyToNumber(money);

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: money.currency,
        // "MXN 49.25" y "MXN 85", como en aguafy.com
        currencyDisplay: "code",
        trailingZeroDisplay: "stripIfInteger",
    }).format(value);
}