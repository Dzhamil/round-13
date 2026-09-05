import * as S from "./PanelAdminNav.styles";

export function PanelAdminNav() {
    return (
        <S.Root aria-label="Разделы админ-панели">
            <S.Link to="/admin/users">Пользователи</S.Link>
            <S.Link to="/admin/error-journal">Ошибки</S.Link>
            <S.Link to="/admin/google-sheets">Google Sheets</S.Link>
        </S.Root>
    );
}

export default PanelAdminNav;
