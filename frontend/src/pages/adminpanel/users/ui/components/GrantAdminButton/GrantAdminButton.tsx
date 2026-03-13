import { Button } from "../../../../../../shared/ui/Button";
import { adminButtonsStyles } from "../../styles/AdminButtons.styles";

export type GrantAdminButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

export function GrantAdminButton(props: GrantAdminButtonProps) {
    const { disabled, isLoading, onClick } = props;

    return (
        <div style={adminButtonsStyles.buttonWrap}>
            <Button onClick={onClick} disabled={disabled || isLoading} fullWidth>
                {isLoading ? "Назначаем..." : "Назначить админом"}
            </Button>
        </div>
    );
}
