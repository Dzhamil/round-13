import type { CSSProperties } from "react";
import { formatMoney } from "../../../model/money";
import type { PendingPurchaseRequest, ShopOrderStatus } from "../../../model/shop.types";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    items: PendingPurchaseRequest[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};

export function AdminPurchaseHistory({ items, loading, error, reload }: Props) {
    return (
        <section style={{ marginTop: 20 }}>
            <div style={s.sectionTitle}>История покупок</div>
            <div style={s.sectionDescription}>
                Здесь хранятся уже обработанные заявки участников: подтвержденные, отклоненные и завершившиеся ошибкой.
            </div>

            {loading ? <div style={s.historyEmpty}>Загружаем историю…</div> : null}

            {error ? (
                <div style={{ marginTop: 12 }}>
                    <div style={s.historyEmpty}>{error}</div>
                    <button type="button" onClick={() => void reload()} style={{ ...s.backButton, marginTop: 10 }}>
                        Повторить
                    </button>
                </div>
            ) : null}

            {!loading && !error && items.length === 0 ? (
                <div style={s.historyEmpty}>Обработанных заявок пока нет.</div>
            ) : null}

            {!loading && !error && items.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    {items.map((item) => (
                        <div key={item.id} style={s.historyItem}>
                            <div style={s.historyRow}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{item.buyerName}</div>
                                    <div style={{ ...s.historyDate, marginTop: 4 }}>
                                        {item.productTitle}
                                        {item.itemCount > 1 ? ` · ${item.itemCount} шт.` : ""}
                                    </div>
                                </div>
                                <div style={statusBadgeStyle(item.status)}>
                                    {getStatusMeta(item.status).label}
                                </div>
                            </div>

                            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>
                                {formatMoney({ amount: item.totalAmount, currency: item.currency })}
                            </div>

                            <div style={{ ...s.historyDate, marginTop: 8 }}>
                                {item.category} · создано {formatDate(item.createdAt)} · обновлено {formatDate(item.updatedAt)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function getStatusMeta(status: ShopOrderStatus): { label: string } {
    switch (status) {
        case "PAID":
            return { label: "Подтверждено" };
        case "CANCELED":
            return { label: "Отклонено" };
        case "FAILED":
            return { label: "Ошибка" };
        case "PENDING":
        default:
            return { label: "На рассмотрении" };
    }
}

function statusBadgeStyle(status: ShopOrderStatus): CSSProperties {
    if (status === "PAID") {
        return {
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: "#1f7a3d",
            background: "rgba(53,199,89,0.16)",
        };
    }

    if (status === "CANCELED" || status === "FAILED") {
        return {
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: "#c13a3a",
            background: "rgba(255,59,48,0.14)",
        };
    }

    return {
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: "#8a6b12",
        background: "rgba(255,204,0,0.18)",
    };
}

function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
