// frontend/src/pages/schedule/SchedulePage.tsx
import { useEffect, useMemo, useState } from "react";

import {
    getTrainingSessions,
    type TrainingSessionResponse,
    type TrainingSessionsFilter,
} from "../../shared/api/training.api";
import {
    ScheduleDetailsModal,
    ScheduleFilters,
    ScheduleGrid,
    SchedulePageError,
    SchedulePageHeader,
    SchedulePageShell,
} from "./components";

export function SchedulePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<TrainingSessionResponse[]>([]);
    const [selected, setSelected] = useState<TrainingSessionResponse | null>(null);

    const [filter, setFilter] = useState<TrainingSessionsFilter>({});

    async function load(nextFilter: TrainingSessionsFilter = filter) {
        setError(null);
        setLoading(true);
        try {
            const data = await getTrainingSessions(nextFilter);
            setItems(data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось загрузить расписание");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        void load(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.type, filter.coachId, filter.from, filter.to]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => (a.startsAt > b.startsAt ? 1 : -1));
    }, [items]);

    return (
        <SchedulePageShell>
            <SchedulePageHeader onReload={() => load(filter)} loading={loading} />
            <ScheduleFilters value={filter} onChange={setFilter} disabled={loading} />
            <SchedulePageError message={error} />
            <ScheduleGrid items={sorted} onSelect={setSelected} />

            <ScheduleDetailsModal
                tile={selected}
                onClose={() => {
                    setSelected(null);
                    void load(filter);
                }}
            />
        </SchedulePageShell>
    );
}
