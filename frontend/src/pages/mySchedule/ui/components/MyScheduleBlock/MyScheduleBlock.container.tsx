import { useCallback, useEffect, useState } from "react";

import type { MyScheduleItem } from "../../../model/mySchedule.types";
import { fetchMySchedule, requestMyScheduleCancellation } from "../../../api/mySchedule.api";

import { MyScheduleBlock } from "./MyScheduleBlock";

type Props = {
    title?: string;
    from?: string;
    to?: string;
};

export function MyScheduleBlockContainer({ title, from, to }: Props) {
    const [items, setItems] = useState<MyScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchMySchedule({ from, to });
            setItems(data);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Не удалось загрузить расписание";
            setError(String(msg));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        void load();
    }, [load]);

    async function handleRequestCancel(sessionId: string) {
        setCancellingSessionId(sessionId);
        setError(null);

        try {
            await requestMyScheduleCancellation(sessionId);
            await load();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Не удалось отправить запрос на отмену";
            setError(String(msg));
        } finally {
            setCancellingSessionId(null);
        }
    }

    return (
        <MyScheduleBlock
            title={title}
            loading={loading}
            error={error}
            items={items}
            onRetry={load}
            onRequestCancel={handleRequestCancel}
            cancellingSessionId={cancellingSessionId}
        />
    );
}
