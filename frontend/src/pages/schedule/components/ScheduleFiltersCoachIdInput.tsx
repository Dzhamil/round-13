import Field from "../../../shared/ui/Field";
import Input from "../../../shared/ui/Input";

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
            <Input
                value={value ?? ""}
                onChange={(v) => onChange(v.trim() ? v.trim() : undefined)}
                placeholder="UUID тренера"
                disabled={disabled}
                autoComplete="off"
            />
        </Field>
    );
}
