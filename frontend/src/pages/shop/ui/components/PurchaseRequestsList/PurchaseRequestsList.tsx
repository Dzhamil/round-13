import { useState } from "react";
import { updateShopOrderStatus } from "../../../api/order.api";
import type { ShopOrderStatus } from "../../../model/shop.types";
import { usePendingPurchaseRequests } from "../../../model/usePendingPurchaseRequests";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { PurchaseRequestCard } from "../PurchaseRequestCard/PurchaseRequestCard";

export function PurchaseRequestsList() {
    const { items, loading, error, reload } = usePendingPurchaseRequests();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const updateStatus = async (
        orderId: string,
        status: Extract<ShopOrderStatus, "PAID" | "CANCELED">
    ) => {
        if (busyId) return;
        setBusyId(orderId);
        setActionError(null);

        try {
            await updateShopOrderStatus(orderId, status);
            await reload();
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Не удалось обновить статус заявки."));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section>
            <div style={s.sectionTitle}>Заявки участников</div>
            <div style={s.sectionDescription}>
                Новые покупки попадают сюда со статусом ожидания. После подтверждения или отклонения они исчезают из очереди.
            </div>

            {actionError ? (
                <div style={{ ...s.actionError, marginTop: 12, marginBottom: 0 }}>{actionError}</div>
            ) : null}

            {loading ? <div style={s.historyEmpty}>Загрузка заявок…</div> : null}

            {error ? (
                <div style={{ marginTop: 12 }}>
                    <div style={s.historyEmpty}>{error}</div>
                    <button type="button" onClick={() => void reload()} style={{ ...s.backButton, marginTop: 10 }}>
                        Повторить
                    </button>
                </div>
            ) : null}

            {!loading && !error && items.length === 0 ? (
                <div style={s.historyEmpty}>Новых заявок пока нет.</div>
            ) : null}

            {!loading && !error && items.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    {items.map((item) => (
                        <PurchaseRequestCard
                            key={item.id}
                            item={item}
                            busy={busyId === item.id}
                            onApprove={(id) => void updateStatus(id, "PAID")}
                            onReject={(id) => void updateStatus(id, "CANCELED")}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object") {
        if ("response" in err) {
            const response = (err as { response?: { data?: { message?: unknown } } }).response;
            const message = response?.data?.message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }
        if ("message" in err) {
            const message = (err as { message?: unknown }).message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }
    }
    return fallback;
}
