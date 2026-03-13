import Field from "../../../shared/ui/Field";
import type { TrainingSessionsFilter } from "../../../shared/api/training.api";
import { scheduleFiltersStyles as s } from "./ScheduleFilters.styles";

export function ScheduleFiltersTypeSelect({
                                              value,
                                              onChange,
                                              disabled,
                                          }: {
    value: TrainingSessionsFilter["type"] | undefined;
    onChange: (next: TrainingSessionsFilter["type"] | undefined) => void;
    disabled: boolean;
}) {
    return (
        <Field label="Тип">
            <select
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        (e.target.value || undefined) as TrainingSessionsFilter["type"]
                    )
                }
                disabled={disabled}
                style={s.select}
            >
                <option value="">Все</option>
                <option value="GROUP">Групповые</option>
                <option value="PERSONAL">Персональные</option>
                <option value="OPEN">Открытые</option>
            </select>
        </Field>
    );
}
