import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearPanelAccessToken } from "../../../../../../shared/lib/panelTokens";
import PanelAdminNav from "../PanelAdminNav/PanelAdminNav";
import PanelLogoutButton from "../PanelLogoutButton/PanelLogoutButton";
import * as S from "./PanelAdminLayout.styles";

const titles: Record<string, string> = {
    "/admin/users": "Пользователи",
    "/admin/error-journal": "Журнал ошибок",
    "/admin/google-sheets": "Google Sheets · Schedule 2.0",
};

export function PanelAdminLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    function logout() {
        clearPanelAccessToken();
        navigate("/admin/login", { replace: true });
    }

    return (
        <S.Page>
            <S.Panel>
                <S.Header>
                    <S.TitleRow>
                        <S.TitleSlot>
                            <S.TitleReserve aria-hidden="true">Google Sheets · Schedule 2.0</S.TitleReserve>
                            <S.Title>{titles[pathname.replace(/\/$/, "")]}</S.Title>
                        </S.TitleSlot>
                        <PanelLogoutButton onClick={logout} />
                    </S.TitleRow>
                    <PanelAdminNav />
                </S.Header>
                <S.Content key={pathname} data-testid="panel-admin-content">
                    <Outlet />
                </S.Content>
            </S.Panel>
        </S.Page>
    );
}
