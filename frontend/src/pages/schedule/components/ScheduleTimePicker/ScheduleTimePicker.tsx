import { useEffect, useRef, type MutableRefObject } from "react";

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
    onApply: (hour: string, minute: string) => void;
    onCommitTime?: (hour: string, minute: string) => void;
};

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const ITEM_HEIGHT = 44;

function getCenteredValue(scrollNode: HTMLDivElement | null, values: string[]): string | null {
    if (!scrollNode) {
        return null;
    }

    const centeredIndex = Math.round(scrollNode.scrollTop / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(values.length - 1, centeredIndex));

    return values[safeIndex] ?? null;
}

function syncCenteredValue(
    scrollNode: HTMLDivElement,
    values: string[],
    currentValueRef: MutableRefObject<string>,
    onChange: (value: string) => void
) {
    const nextValue = getCenteredValue(scrollNode, values);

    if (!nextValue || nextValue === currentValueRef.current) {
        return;
    }

    currentValueRef.current = nextValue;
    onChange(nextValue);
}

export function ScheduleTimePicker({
    open,
    title,
    hour,
    minute,
    onHourChange,
    onMinuteChange,
    onClose,
    onApply,
    onCommitTime,
}: Props) {
    const hourRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const minuteRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const hourScrollRef = useRef<HTMLDivElement | null>(null);
    const minuteScrollRef = useRef<HTMLDivElement | null>(null);
    const currentHourRef = useRef(hour);
    const currentMinuteRef = useRef(minute);
    const initialScrollDoneRef = useRef(false);

    useEffect(() => {
        currentHourRef.current = hour;
    }, [hour]);

    useEffect(() => {
        currentMinuteRef.current = minute;
    }, [minute]);

    useEffect(() => {
        if (!open) {
            initialScrollDoneRef.current = false;
            return;
        }

        if (initialScrollDoneRef.current) {
            return;
        }

        initialScrollDoneRef.current = true;
        const frame = window.requestAnimationFrame(() => {
            hourRefs.current[hour]?.scrollIntoView({ block: "center" });
            minuteRefs.current[minute]?.scrollIntoView({ block: "center" });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [hour, minute, open]);

    if (!open) {
        return null;
    }

    const selectHour = (value: string) => {
        currentHourRef.current = value;
        onHourChange(value);
    };

    const selectMinute = (value: string) => {
        currentMinuteRef.current = value;
        onMinuteChange(value);
    };

    const handleHourClick = (value: string) => {
        selectHour(value);
        hourRefs.current[value]?.scrollIntoView({ block: "center" });
        onCommitTime?.(value, currentMinuteRef.current);
    };

    const handleMinuteClick = (value: string) => {
        selectMinute(value);
        minuteRefs.current[value]?.scrollIntoView({ block: "center" });
        onCommitTime?.(currentHourRef.current, value);
    };

    const handleApply = () => {
        const visibleHour = getCenteredValue(hourScrollRef.current, HOURS) ?? currentHourRef.current;
        const visibleMinute = getCenteredValue(minuteScrollRef.current, MINUTES) ?? currentMinuteRef.current;

        selectHour(visibleHour);
        selectMinute(visibleMinute);
        onApply(visibleHour, visibleMinute);
    };

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
                        <div
                            ref={hourScrollRef}
                            style={s.scroll}
                            onScroll={(event) =>
                                syncCenteredValue(event.currentTarget, HOURS, currentHourRef, onHourChange)
                            }
                        >
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
                                    onClick={() => handleHourClick(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={s.divider}>:</div>

                    <div style={s.column}>
                        <div
                            ref={minuteScrollRef}
                            style={s.scroll}
                            onScroll={(event) =>
                                syncCenteredValue(event.currentTarget, MINUTES, currentMinuteRef, onMinuteChange)
                            }
                        >
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
                                    onClick={() => handleMinuteClick(value)}
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
                    <Button onClick={handleApply}>Готово</Button>
                </div>
            </div>
        </div>
    );
}
