import { Button } from "../../../../../../shared/ui/Button";

export type PanelLogoutButtonProps = {
    onClick: () => void;
};

export function PanelLogoutButton(props: PanelLogoutButtonProps) {
    const { onClick } = props;

    return (
        <Button onClick={onClick} fullWidth>
    Выйти из админ-панели
    </Button>
);
}

export default PanelLogoutButton;
