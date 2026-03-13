import { formatMoney } from "../../../model/money";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import type { MoneyCurrency } from "../../../model/shop.types";

type PurchaseHistoryItem = {
    id: string;
    title: string;
    date: string; // ISO или уже форматированная строка (пока моки)
    amount: number; // пока моки в рублях
};

type PurchaseHistoryProps = {
    items?: PurchaseHistoryItem[];
};

export function PurchaseHistory({ items = mockHistory }: PurchaseHistoryProps) {
    return (
        <section style={{ marginTop: 18 }}>
            <div style={s.sectionTitle}>История покупок</div>

            {items.length === 0 ? (
                <div style={s.historyEmpty}>Покупок пока нет.</div>
            ) : (
                <div style={s.grid}>
                    {items.map((x) => (
                        <div key={x.id} style={s.historyItem}>
                            <div style={s.historyRow}>
                                <div style={{ fontWeight: 700 }}>{x.title}</div>
                                <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                                    {formatAmountCompat(x.amount)}
                                </div>
                            </div>

                            <div style={s.historyDate}>{x.date}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

const mockHistory: PurchaseHistoryItem[] = [
    {
        id: "h1",
        title: "Абонемент на месяц",
        date: "2026-02-01",
        amount: 6000,
    },
];

/**
 * Совместимость с текущими моками:
 * - mock хранит сумму в рублях
 * - formatMoney ожидает minor units
 */
function formatAmountCompat(amountRubLike: number): string {
    const safe = Number.isFinite(amountRubLike) ? amountRubLike : 0;

    const currency: MoneyCurrency = "RUB";
    const amountMinor = Math.trunc(safe * 100);

    return formatMoney({ amount: amountMinor, currency });
}
