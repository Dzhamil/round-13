import { statsPeriodButtonStyles as s } from "./statsPeriodButton.styles";

type StatsPeriodButtonProps = {
    active: boolean;
    label: string;
    onClick: () => void;
};

/**
 * Кнопка переключения периода статистики.
 *
 * Используется внутри StatsPeriodToggle.
 */
export function StatsPeriodButton({
                                      active,
                                      label,
                                      onClick,
                                  }: StatsPeriodButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={s.button(active)}
        >
            {label}
        </button>
    );
}
