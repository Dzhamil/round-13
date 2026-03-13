import Field from "../../../shared/ui/Field";
import { scheduleFiltersStyles as s } from "./ScheduleFilters.styles";

export function ScheduleFiltersCoachIdInput({
                                                value,
                                                onChange,
                                                disabled,
                                            }: {
    value: string | undefined;
    onChange: (next: string | undefined) => void;
    disabled: boolean;
}) {
    return (
        <Field label="Тренер (coachId)">
            <input
                value={value ?? ""}
                onChange={(e) =>
                    onChange(e.target.value.trim() ? e.target.value.trim() : undefined)
                }
                placeholder="UUID тренера"
                disabled={disabled}
                autoComplete="off"
                style={s.textInput}
            />
        </Field>
    );
}
