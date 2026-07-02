import { useNavigate } from "react-router-dom";

import ErrorText from "../../../../../shared/ui/ErrorText";
import PanelLogoutButton from "../../../shared/ui/components/PanelLogoutButton/PanelLogoutButton";
import PanelAdminNav from "../../../shared/ui/components/PanelAdminNav/PanelAdminNav";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";

import { UsersTable } from "../components/UsersTable/UsersTable";
import { usePanelUsers } from "../../model/usePanelUsers";
import * as S from "../styles/AdminUsersPage.styles";

export function AdminUsersPageContainer() {
    const navigate = useNavigate();

    const {
        users,
        isLoading,
        error,
        actionLoadingUserId,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
    } = usePanelUsers();

    function handleLogout(): void {
        clearPanelAccessToken();
        navigate("/admin/login", { replace: true });
    }

    return (
        <S.PageRoot>
            <S.Panel>
                <S.Header>
                    <S.HeadingGroup>
                        <S.Title>Пользователи</S.Title>
                        <PanelAdminNav />
                    </S.HeadingGroup>

                    <S.HeaderActions>
                        {isLoading && <S.Loading>Загрузка…</S.Loading>}
                        <PanelLogoutButton onClick={handleLogout} />
                    </S.HeaderActions>
                </S.Header>

                {error && (
                    <S.ErrorSlot>
                        <ErrorText message={error} />
                    </S.ErrorSlot>
                )}

                <UsersTable
                    users={users}
                    actionLoadingUserId={actionLoadingUserId}
                    onGrantAdmin={onGrantAdmin}
                    onRevokeAdmin={onRevokeAdmin}
                    onGrantCoach={onGrantCoach}
                    onRevokeCoach={onRevokeCoach}
                />
            </S.Panel>
        </S.PageRoot>
    );
}

export default AdminUsersPageContainer;
