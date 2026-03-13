import Field from "../../../shared/ui/Field";
import { scheduleFiltersStyles as s } from "./ScheduleFilters.styles";
import { DateTimeLocalInput } from "./DateTimeLocalInput";

export function ScheduleFiltersDateRange({
                                             from,
                                             to,
                                             onChange,
                                             disabled,
                                         }: {
    from: string | undefined;
    to: string | undefined;
    onChange: (next: { from?: string; to?: string }) => void;
    disabled: boolean;
}) {
    return (
        <div style={s.row2}>
            <Field label="С">
                <DateTimeLocalInput
                    valueIso={from}
                    onChangeIso={(v) => onChange({ from: v })}
                    disabled={disabled}
                />
            </Field>

            <Field label="По">
                <DateTimeLocalInput
                    valueIso={to}
                    onChangeIso={(v) => onChange({ to: v })}
                    disabled={disabled}
                />
            </Field>
        </div>
    );
}
