import { useEffect, useState } from "react";
import { http } from "../../../../../shared/api/http";
import { PurchaseRequestCard } from "../PurchaseRequestCard/PurchaseRequestCard";

/**
 * Компонент, который загружает список заявок на покупку и отображает их для админа.
 */
type PurchaseRequestItem = {
    id: string;
    buyerName: string;
    avatarUrl?: string | null;
    category: string;
    productTitle: string;
};

export function PurchaseRequestsList() {
    const [items, setItems] = useState<PurchaseRequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // загрузка заявок
    useEffect(() => {
        setLoading(true);
        http
            .get<PurchaseRequestItem[]>("/admin/shop/orders/pending")
            .then((r) => {
                setItems(r.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Не удалось загрузить заявки.");
                setLoading(false);
            });
    }, []);

    const confirm = (id: string) => {
        // подтверждение реализуем позже; просто убираем из списка
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    if (loading) {
        return <div>Загрузка заявок…</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (items.length === 0) {
        return <div>Заявок пока нет.</div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((it) => (
                <PurchaseRequestCard key={it.id} item={it} onConfirm={confirm} />
            ))}
        </div>
    );
}
