/**
 * Карточка заявки на покупку. Отображает аватар, ник, категорию, товар и кнопку подтверждения.
 */
type PurchaseRequestItem = {
    id: string;
    buyerName: string;
    avatarUrl?: string | null;
    category: string;
    productTitle: string;
};

type Props = {
    item: PurchaseRequestItem;
    onConfirm: (id: string) => void;
};

export function PurchaseRequestCard({ item, onConfirm }: Props) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
            }}
        >
            {item.avatarUrl ? (
                <img
                    src={item.avatarUrl}
                    alt={item.buyerName}
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                />
            ) : (
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                    }}
                />
            )}

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.buyerName}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {item.category} → {item.productTitle}
                </div>
            </div>

            <button onClick={() => onConfirm(item.id)}>Подтвердить</button>
        </div>
    );
}
