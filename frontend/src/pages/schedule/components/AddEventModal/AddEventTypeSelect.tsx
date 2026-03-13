import type { EventTypeOption } from "../../model/schedule.types";
import { addEventModalStyles as s } from "./addEventModal.styles";

type Props = {
    value: string;
    open: boolean;
    selectedLabel: string;
    options: EventTypeOption[];
    onToggle: () => void;
    onSelect: (value: string) => void;
};

export function AddEventTypeSelect({
    value,
    open,
    selectedLabel,
    options,
    onToggle,
    onSelect,
}: Props) {
    return (
        <div style={s.selectWrap}>
            <button type="button" style={s.selectButton} onClick={onToggle}>
                <span style={s.selectValueWrap}>
                    <span style={s.selectValue}>{selectedLabel}</span>
                </span>
                <span style={s.selectChevron}>{open ? "▲" : "▼"}</span>
            </button>

            {open ? (
                <div style={s.dropdownList}>
                    {options.map((option) => {
                        const isActive = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                style={{
                                    ...s.dropdownItem,
                                    ...(isActive ? s.dropdownItemActive : {}),
                                }}
                                onClick={() => onSelect(option.value)}
                            >
                                <span style={s.dropdownItemTitle}>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
