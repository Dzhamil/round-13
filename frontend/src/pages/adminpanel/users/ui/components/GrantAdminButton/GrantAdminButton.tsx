import { ActionButton } from "../../styles/AdminButtons.styles";

export type GrantAdminButtonProps = {
    disabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
};

export function GrantAdminButton(props: GrantAdminButtonProps) {
    const { disabled, isLoading, onClick } = props;

    return (
        <ActionButton type="button" onClick={onClick} disabled={disabled || isLoading}>
            {isLoading ? "Назначаем..." : "Назначить админом"}
        </ActionButton>
    );
}
