import { ActionButton } from "../../styles/AdminButtons.styles";

export type RevokeCoachButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

/**
 * Кнопка снятия тренерских прав у пользователя. Переводит тренера или администратора в роль атлета.
 */
export function RevokeCoachButton(props: RevokeCoachButtonProps) {
    const { disabled, isLoading, onClick } = props;
    return (
        <ActionButton type="button" onClick={onClick} disabled={disabled || isLoading} $tone="danger">
            {isLoading ? "Снимаем..." : "Убрать тренерские права"}
        </ActionButton>
    );
}

export default RevokeCoachButton;
