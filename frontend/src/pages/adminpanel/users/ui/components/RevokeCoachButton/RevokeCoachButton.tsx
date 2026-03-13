import { Button } from "../../../../../../shared/ui/Button";
import { adminButtonsStyles } from "../../styles/AdminButtons.styles";

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
        <div style={adminButtonsStyles.buttonWrap}>
            <Button onClick={onClick} disabled={disabled || isLoading} fullWidth>
                {isLoading ? "Снимаем..." : "Убрать тренерские права"}
            </Button>
        </div>
    );
}

export default RevokeCoachButton;
