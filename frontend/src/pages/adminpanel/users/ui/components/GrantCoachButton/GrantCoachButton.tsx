import { ActionButton } from "../../styles/AdminButtons.styles";

export type GrantCoachButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

/**
 * Кнопка назначения пользователя тренером.
 */
export function GrantCoachButton(props: GrantCoachButtonProps) {
    const { disabled, isLoading, onClick } = props;
    return (
        <ActionButton type="button" onClick={onClick} disabled={disabled || isLoading}>
            {isLoading ? "Назначаем..." : "Назначить тренером"}
        </ActionButton>
    );
}

export default GrantCoachButton;
