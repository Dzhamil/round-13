// frontend/src/pages/schedule/components/ScheduleFilters.tsx
import type { TrainingSessionsFilter } from "../../../shared/api/training.api";
import { scheduleFiltersStyles as s } from "./ScheduleFilters.styles";
import { ScheduleFiltersTypeSelect } from "./ScheduleFiltersTypeSelect";
import { ScheduleFiltersCoachIdInput } from "./ScheduleFiltersCoachIdInput";
import { ScheduleFiltersDateRange } from "./ScheduleFiltersDateRange";
import { ScheduleFiltersResetButton } from "./ScheduleFiltersResetButton";

const EMPTY: TrainingSessionsFilter = {};

export function ScheduleFilters({
                                    value,
                                    onChange,
                                    disabled = false,
                                }: {
    value: TrainingSessionsFilter;
    onChange: (next: TrainingSessionsFilter) => void;
    disabled?: boolean;
}) {
    const hasAny =
        Boolean(value.type) ||
        Boolean(value.coachId) ||
        Boolean(value.from) ||
        Boolean(value.to);

    return (
        <div style={s.root}>
            <div style={s.stack}>
                <ScheduleFiltersTypeSelect
                    value={value.type}
                    onChange={(type) => onChange({ ...value, type })}
                    disabled={disabled}
                />

                <ScheduleFiltersCoachIdInput
                    value={value.coachId}
                    onChange={(coachId) => onChange({ ...value, coachId })}
                    disabled={disabled}
                />

                <ScheduleFiltersDateRange
                    from={value.from}
                    to={value.to}
                    onChange={(range) => onChange({ ...value, ...range })}
                    disabled={disabled}
                />

                <div style={s.actions}>
                    <ScheduleFiltersResetButton
                        onClick={() => onChange(EMPTY)}
                        disabled={disabled || !hasAny}
                    />
                </div>
            </div>
        </div>
    );
}
