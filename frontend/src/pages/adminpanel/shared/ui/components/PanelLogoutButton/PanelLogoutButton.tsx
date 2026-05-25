import * as S from "./PanelLogoutButton.styles";

export type PanelLogoutButtonProps = {
    onClick: () => void;
};

export function PanelLogoutButton(props: PanelLogoutButtonProps) {
    const { onClick } = props;

    return (
        <S.LogoutButton type="button" onClick={onClick}>
            Выйти
        </S.LogoutButton>
    );
}

export default PanelLogoutButton;
