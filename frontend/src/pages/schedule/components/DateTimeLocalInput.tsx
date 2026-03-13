// frontend/src/pages/schedule/components/DateTimeLocalInput.tsx
import { scheduleFiltersStyles as s } from "./ScheduleFilters.styles";

function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

function toLocalInputValue(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function localInputToIso(local: string): string | undefined {
    const v = local.trim();
    if (!v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
}

export function DateTimeLocalInput({
                                       valueIso,
                                       onChangeIso,
                                       disabled,
                                   }: {
    valueIso?: string;
    onChangeIso: (nextIso?: string) => void;
    disabled: boolean;
}) {
    return (
        <input
            type="datetime-local"
            value={toLocalInputValue(valueIso)}
            onChange={(e) => onChangeIso(localInputToIso(e.target.value))}
            disabled={disabled}
            style={s.dateTime}
        />
    );
}
