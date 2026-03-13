import { useEffect, useRef } from "react";

import { Button } from "../../../../shared/ui/Button";
import { scheduleTimePickerStyles as s } from "./scheduleTimePicker.styles";

type Props = {
    open: boolean;
    title: string;
    hour: string;
    minute: string;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
    onClose: () => void;
    onApply: () => void;
};

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

export function ScheduleTimePicker({
    open,
    title,
    hour,
    minute,
    onHourChange,
    onMinuteChange,
    onClose,
    onApply,
}: Props) {
    const hourRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const minuteRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        if (!open) {
            return;
        }

        hourRefs.current[hour]?.scrollIntoView({ block: "center" });
        minuteRefs.current[minute]?.scrollIntoView({ block: "center" });
    }, [hour, minute, open]);

    if (!open) {
        return null;
    }

    return (
        <div
            style={s.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div style={s.card}>
                <div style={s.header}>
                    <h4 style={s.title}>{title}</h4>
                </div>

                <div style={s.wheel}>
                    <div style={s.highlight} />

                    <div style={s.column}>
                        <div style={s.scroll}>
                            {HOURS.map((value) => (
                                <button
                                    key={value}
                                    ref={(node) => {
                                        hourRefs.current[value] = node;
                                    }}
                                    type="button"
                                    style={{
                                        ...s.item,
                                        ...(value === hour ? s.itemActive : {}),
                                    }}
                                    onClick={() => onHourChange(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={s.divider}>:</div>

                    <div style={s.column}>
                        <div style={s.scroll}>
                            {MINUTES.map((value) => (
                                <button
                                    key={value}
                                    ref={(node) => {
                                        minuteRefs.current[value] = node;
                                    }}
                                    type="button"
                                    style={{
                                        ...s.item,
                                        ...(value === minute ? s.itemActive : {}),
                                    }}
                                    onClick={() => onMinuteChange(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={s.actions}>
                    <Button onClick={onClose} variant="secondary">
                        Отмена
                    </Button>
                    <Button onClick={onApply}>Готово</Button>
                </div>
            </div>
        </div>
    );
}
