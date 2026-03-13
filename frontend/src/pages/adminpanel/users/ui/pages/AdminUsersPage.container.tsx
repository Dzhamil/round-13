import { useNavigate } from "react-router-dom";

import ErrorText from "../../../../../shared/ui/ErrorText";
import PanelLogoutButton from "../../../shared/ui/components/PanelLogoutButton/PanelLogoutButton";
import { PanelNavigation } from "../../../shared/ui/components/PanelNavigation/PanelNavigation";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";

import { UsersTable } from "../components/UsersTable/UsersTable";
import { usePanelUsers } from "../../model/usePanelUsers";
import { adminUsersPageStyles } from "../styles/AdminUsersPage.styles";

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
        <div style={adminUsersPageStyles.root}>
            <PanelNavigation active="users" />

            <div style={adminUsersPageStyles.header}>
                <h2 style={adminUsersPageStyles.title}>Пользователи</h2>
                {isLoading && <div style={adminUsersPageStyles.loading}>Загрузка…</div>}
            </div>

            <PanelLogoutButton onClick={handleLogout} />

            {error && <ErrorText message={error} />}

            <UsersTable
                users={users}
                actionLoadingUserId={actionLoadingUserId}
                onGrantAdmin={onGrantAdmin}
                onRevokeAdmin={onRevokeAdmin}
                onGrantCoach={onGrantCoach}
                onRevokeCoach={onRevokeCoach}
            />
        </div>
    );
}

export default AdminUsersPageContainer;
