import { ActionButton } from "../../styles/AdminButtons.styles";

export type RevokeAdminButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

export function RevokeAdminButton(props: RevokeAdminButtonProps) {
    const { disabled, isLoading, onClick } = props;

    return (
        <ActionButton type="button" onClick={onClick} disabled={disabled || isLoading} $tone="danger">
            {isLoading ? "Снимаем..." : "Убрать админские права"}
        </ActionButton>
    );
}
