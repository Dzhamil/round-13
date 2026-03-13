import { Button } from "../../../../../../shared/ui/Button";
import { adminButtonsStyles } from "../../styles/AdminButtons.styles";

export type RevokeAdminButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

export function RevokeAdminButton(props: RevokeAdminButtonProps) {
    const { disabled, isLoading, onClick } = props;

    return (
        <div style={adminButtonsStyles.buttonWrap}>
            <Button onClick={onClick} disabled={disabled || isLoading} fullWidth>
                {isLoading ? "Снимаем..." : "Убрать админские права"}
            </Button>
        </div>
    );
}
