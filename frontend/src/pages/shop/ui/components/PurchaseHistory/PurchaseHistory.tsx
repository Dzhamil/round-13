import type { CSSProperties } from "react";
import { formatMoney } from "../../../model/money";
import type { ShopOrderStatus } from "../../../model/shop.types";
import { useShopOrders } from "../../../model/useShopOrders";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

export function PurchaseHistory() {
    const { items, loading, error, reload } = useShopOrders();

    return (
        <section style={{ marginTop: 18 }}>
            <div style={s.sectionTitle}>Мои заявки</div>
            <div style={s.sectionDescription}>
                После нажатия «Купить товар» заявка уходит администратору и ее статус появляется здесь.
            </div>

            {loading ? <div style={s.historyEmpty}>Загружаем заявки…</div> : null}

            {error ? (
                <div style={{ marginTop: 12 }}>
                    <div style={s.historyEmpty}>{error}</div>
                    <button type="button" onClick={() => void reload()} style={{ ...s.backButton, marginTop: 10 }}>
                        Повторить
                    </button>
                </div>
            ) : null}

            {!loading && !error && items.length === 0 ? (
                <div style={s.historyEmpty}>
                    Заявок пока нет. Оформите товар, и он сразу появится в этом списке.
                </div>
            ) : null}

            {!loading && !error && items.length > 0 ? (
                <div style={s.grid}>
                    {items.map((item) => (
                        <div key={item.id} style={s.historyItem}>
                            <div style={s.historyRow}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {item.title}
                                        {item.itemCount > 1 ? ` · ${item.itemCount} шт.` : ""}
                                    </div>
                                    <div style={s.historyDate}>{formatOrderDate(item.createdAt)}</div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                                        {formatMoney({ amount: item.totalAmount, currency: item.currency })}
                                    </div>
                                    <div style={statusBadgeStyle(item.status)}>
                                        {getStatusMeta(item.status).label}
                                    </div>
                                </div>
                            </div>

                            <div style={{ ...s.historyDate, marginTop: 8 }}>
                                {getStatusMeta(item.status).description}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function getStatusMeta(status: ShopOrderStatus): { label: string; description: string } {
    switch (status) {
        case "PAID":
            return {
                label: "Подтверждено",
                description: "Заявка обработана. Если это услуга или мерч, администратор уже может выдать товар.",
            };
        case "CANCELED":
            return {
                label: "Отклонено",
                description: "Заявка закрыта. Если это ошибка, напишите администратору клуба.",
            };
        case "FAILED":
            return {
                label: "Ошибка",
                description: "При обработке заявки возникла ошибка. Попробуйте оформить заказ снова.",
            };
        case "PENDING":
        default:
            return {
                label: "На рассмотрении",
                description: "Администратор еще не обработал заявку. Дополнительных действий от вас пока не требуется.",
            };
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

function formatOrderDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
