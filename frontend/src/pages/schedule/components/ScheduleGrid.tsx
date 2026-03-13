import type { TrainingSessionResponse } from "../../../shared/api/training.api";
import { schedulePageStyles as s } from "../schedulePage.styles";
import { ScheduleTile } from "./ScheduleTile";

export function ScheduleGrid({
                                 items,
                                 onSelect,
                             }: {
    items: TrainingSessionResponse[];
    onSelect: (item: TrainingSessionResponse) => void;
}) {
    if (items.length === 0) {
        return (
            <div style={s.empty}>
                Ничего не найдено по текущим фильтрам.
                <br />
                Попробуйте сбросить условия или обновить список.
            </div>
        );
    }

    return (
        <div style={s.grid}>
            {items.map((t) => (
                <ScheduleTile key={t.id} item={t} onClick={() => onSelect(t)} />
            ))}
        </div>
    );
}
