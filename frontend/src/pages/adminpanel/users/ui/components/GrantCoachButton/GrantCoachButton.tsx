import { Button } from "../../../../../../shared/ui/Button";
import { adminButtonsStyles } from "../../styles/AdminButtons.styles";

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
        <div style={adminButtonsStyles.buttonWrap}>
            <Button onClick={onClick} disabled={disabled || isLoading} fullWidth>
                {isLoading ? "Назначаем..." : "Назначить тренером"}
            </Button>
        </div>
    );
}

export default GrantCoachButton;
