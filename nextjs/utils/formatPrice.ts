export function formatPrice(
    price: string,
    currencyCode: string,
    currencyMinorUnit: number
) {
    const value =
        Number(price) / Math.pow(10, currencyMinorUnit);

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currencyMinorUnit,
        maximumFractionDigits: currencyMinorUnit,
    }).format(value);
}