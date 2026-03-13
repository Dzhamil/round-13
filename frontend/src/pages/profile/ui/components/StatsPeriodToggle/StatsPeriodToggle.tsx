import { statsPeriodToggleStyles as s } from "./statsPeriodToggle.styles";
import { StatsPeriodButton } from "../StatsPeriodButton/StatsPeriodButton";
import type { StatsPeriod } from "../../../model/profile.period";

type StatsPeriodToggleProps = {
    value: StatsPeriod;
    onChange?: (value: StatsPeriod) => void;
};

/**
 * Переключатель периода статистики (месяц / квартал).
 *
 * UI-компонент: хранение состояния — снаружи.
 */
export function StatsPeriodToggle({ value, onChange }: StatsPeriodToggleProps) {
    return (
        <div style={s.root}>
            <StatsPeriodButton
                active={value === "MONTH"}
                label="Месяц"
                onClick={() => onChange?.("MONTH")}
            />
            <StatsPeriodButton
                active={value === "QUARTER"}
                label="Квартал"
                onClick={() => onChange?.("QUARTER")}
            />
        </div>
    );
}
