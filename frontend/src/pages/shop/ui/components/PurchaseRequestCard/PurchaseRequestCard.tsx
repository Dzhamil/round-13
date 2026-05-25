import { formatMoney } from "../../../model/money";
import type { PendingPurchaseRequest } from "../../../model/shop.types";
import { formatRequestedStartTime } from "../../../model/trainingRequest";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    item: PendingPurchaseRequest;
    busy: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
};

export function PurchaseRequestCard({ item, busy, onApprove, onReject }: Props) {
    const requestedStartTime = formatRequestedStartTime(item.requestedStartTime);
    const primaryActionStyle = {
        ...s.backButton,
        padding: "8px 12px",
        fontSize: 13,
    };

    const dangerActionStyle = {
        ...primaryActionStyle,
        background: "transparent",
        color: "var(--tg-theme-destructive-text-color, #ff3b30)",
        border: "1px solid rgba(255,59,48,0.28)",
    };

    return (
        <div style={s.historyItem}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {item.avatarUrl ? (
                    <img
                        src={item.avatarUrl}
                        alt={item.buyerName}
                        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.08)",
                            flexShrink: 0,
                        }}
                    />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.historyRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#ff4d6d",
                                    flexShrink: 0,
                                }}
                            />
                            <div style={{ fontWeight: 700, minWidth: 0 }}>{item.buyerName}</div>
                        </div>
                        <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                            {formatMoney({ amount: item.totalAmount, currency: item.currency })}
                        </div>
                    </div>

                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>
                        {item.productTitle}
                        {item.itemCount > 1 ? ` · ${item.itemCount} шт.` : ""}
                    </div>

                    <div style={{ ...s.historyDate, marginTop: 6 }}>
                        {item.category} · {formatOrderDate(item.createdAt)}
                    </div>

                    {requestedStartTime ? (
                        <div style={s.trainingRequestSummary}>
                            Запрошенное время: {requestedStartTime}
                        </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={() => onApprove(item.id)}
                            style={{ ...primaryActionStyle, minWidth: 128 }}
                            disabled={busy}
                        >
                            {busy ? "Сохраняем..." : "Подтвердить"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject(item.id)}
                            style={{ ...dangerActionStyle, minWidth: 104 }}
                            disabled={busy}
                        >
                            Отклонить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
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
