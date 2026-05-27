import { useId, useState } from "react";
import type { ShopCategoryType } from "../../../api/category.api";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";

type CategoryTypeOption = {
    value: ShopCategoryType;
    label: string;
};

const CATEGORY_TYPE_OPTIONS: CategoryTypeOption[] = [
    { value: "MERCH", label: "Мерч" },
    { value: "TRAININGS", label: "Тренировки" },
];

type Props = {
    value: ShopCategoryType;
    onChange: (value: ShopCategoryType) => void;
};

export function CategoryTypeSelector({ value, onChange }: Props) {
    const groupId = useId();
    const [focusedValue, setFocusedValue] = useState<ShopCategoryType | null>(null);

    return (
        <fieldset style={s.categoryTypeFieldset}>
            <legend style={s.categoryTypeLegend}>Тип категории</legend>

            <div style={s.categoryTypeGroup}>
                {CATEGORY_TYPE_OPTIONS.map((option) => {
                    const checked = value === option.value;
                    const focused = focusedValue === option.value;

                    return (
                        <label
                            key={option.value}
                            style={{
                                ...s.categoryTypeOption,
                                ...(checked ? s.categoryTypeOptionSelected : null),
                                ...(focused ? s.categoryTypeOptionFocused : null),
                            }}
                        >
                            <input
                                type="radio"
                                name={`${groupId}-category-type`}
                                value={option.value}
                                checked={checked}
                                onChange={() => onChange(option.value)}
                                onFocus={() => setFocusedValue(option.value)}
                                onBlur={() => setFocusedValue(null)}
                                style={s.categoryTypeRadioInput}
                            />
                            <span
                                aria-hidden="true"
                                style={{
                                    ...s.categoryTypeMarker,
                                    ...(checked ? s.categoryTypeMarkerSelected : null),
                                }}
                            />
                            <span style={s.categoryTypeText}>{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
