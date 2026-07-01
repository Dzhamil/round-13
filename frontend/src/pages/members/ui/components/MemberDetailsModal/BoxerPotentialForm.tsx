import { useMemo, useState } from "react";
import type { BoxerPotentialMeasurementRequest } from "../../../model/boxerPotential.types";
import {
    ButtonRow,
    FieldLabel,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionHint,
} from "./memberDetailsModal.styles";

const FIELD_CONFIG = [
    ["pushUps90Sec", "Отжимания за 1.5 минуты"],
    ["pullUps", "Подтягивания"],
    ["jumpSquats90Sec", "Прыжковые приседы за 1.5 минуты"],
    ["punchForceKg", "Сила удара, кг"],
    ["burpees5Min", "Берпи за 5 минут"],
    ["punches20Sec", "Удары за 20 секунд"],
    ["ropeJumps60Sec", "Скакалка за 1 минуту"],
    ["doubleUnders60Sec", "Двойные прыжки за 1 минуту"],
] as const;

type FieldName = typeof FIELD_CONFIG[number][0];

type Props = {
    saving: boolean
    onSubmit: (request: BoxerPotentialMeasurementRequest) => void
}

function toLocalDateTimeInputValue(date: Date): string {
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

const EMPTY_VALUES: Record<FieldName, string> = {
    pushUps90Sec: "",
    pullUps: "",
    jumpSquats90Sec: "",
    punchForceKg: "",
    burpees5Min: "",
    punches20Sec: "",
    ropeJumps60Sec: "",
    doubleUnders60Sec: "",
};

export function BoxerPotentialForm({ saving, onSubmit }: Props) {
    const [open, setOpen] = useState(false);
    const [measuredAt, setMeasuredAt] = useState(() => toLocalDateTimeInputValue(new Date()));
    const [values, setValues] = useState<Record<FieldName, string>>(EMPTY_VALUES);

    const complete = useMemo(() => (
        Boolean(measuredAt) && FIELD_CONFIG.every(([name]) => values[name] !== "" && Number(values[name]) >= 0)
    ), [measuredAt, values]);

    if (!open) {
        return (
            <PrimaryButton type="button" onClick={() => setOpen(true)}>
                Новый замер
            </PrimaryButton>
        );
    }

    const submit = () => {
        if (!complete) {
            return;
        }
        onSubmit({
            measuredAt: new Date(measuredAt).toISOString(),
            pushUps90Sec: Number(values.pushUps90Sec),
            pullUps: Number(values.pullUps),
            jumpSquats90Sec: Number(values.jumpSquats90Sec),
            punchForceKg: Number(values.punchForceKg),
            burpees5Min: Number(values.burpees5Min),
            punches20Sec: Number(values.punches20Sec),
            ropeJumps60Sec: Number(values.ropeJumps60Sec),
            doubleUnders60Sec: Number(values.doubleUnders60Sec),
        });
    };

    return (
        <SectionCard>
            <SectionHint style={{ marginBottom: 12 }}>
                Введите фактические результаты. Баллы рассчитает backend после сохранения.
            </SectionHint>

            <div style={{ marginBottom: 12 }}>
                <FieldLabel>
                    Дата и время замера
                    <NumberInput
                        as="input"
                        type="datetime-local"
                        value={measuredAt}
                        onChange={(event) => setMeasuredAt(event.target.value)}
                    />
                </FieldLabel>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
                {FIELD_CONFIG.map(([name, label]) => (
                    <FieldLabel key={name}>
                        {label}
                        <NumberInput
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={values[name]}
                            onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
                        />
                    </FieldLabel>
                ))}
            </div>

            <ButtonRow>
                <PrimaryButton type="button" disabled={!complete || saving} onClick={submit}>
                    {saving ? "Сохраняем…" : "Сохранить замер"}
                </PrimaryButton>
                <SecondaryButton type="button" disabled={saving} onClick={() => setOpen(false)}>
                    Отмена
                </SecondaryButton>
            </ButtonRow>
        </SectionCard>
    );
}
