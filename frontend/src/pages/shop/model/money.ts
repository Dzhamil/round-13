import type { MoneyCurrency } from "./shop.types";

type FormatMoneyParams = {
    amount: number; // integer: копейки/центы
    currency: MoneyCurrency;
};

/**
 * Форматирует деньги из minor units (например, копейки) в строку.
 *
 * Пример: { amount: 600000, currency: "RUB" } -> "6 000 ₽"
 */
export function formatMoney({ amount, currency }: FormatMoneyParams): string {
    const safeMinor =
        typeof amount === "number" && !isNaN(amount)
            ? Math.floor(amount)
            : 0;

    const major = safeMinor / 100;

    const formatted = major.toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return `${formatted} ${currencySymbol(currency)}`;
}


function currencySymbol(currency: MoneyCurrency): string {
    switch (currency) {
        case "RUB":
            return "₽";
        case "USD":
            return "$";
        case "EUR":
            return "€";
        default:
            return currency;
    }
}
