import { ActionButton } from "../../styles/AdminButtons.styles";

export type ResetTemporaryPasswordButtonProps = {
    isLoading: boolean;
    onClick: () => void;
};

export function ResetTemporaryPasswordButton({
    isLoading,
    onClick,
}: ResetTemporaryPasswordButtonProps) {
    return (
        <ActionButton type="button" onClick={onClick} disabled={isLoading}>
            {isLoading ? "Сбрасываем…" : "Сбросить временный пароль"}
        </ActionButton>
    );
}
