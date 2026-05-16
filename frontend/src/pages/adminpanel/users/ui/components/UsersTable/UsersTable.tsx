import type { PanelUserListItem } from "../../../api/panelUsers.api";
import { usersTableStyles } from "../../styles/UsersTable.styles";
import { GrantAdminButton } from "../GrantAdminButton/GrantAdminButton";
import { RevokeAdminButton } from "../RevokeAdminButton/RevokeAdminButton";
import { GrantCoachButton } from "../GrantCoachButton/GrantCoachButton";
import { RevokeCoachButton } from "../RevokeCoachButton/RevokeCoachButton";

export type UsersTableProps = {
    users: PanelUserListItem[];
    actionLoadingUserId: string | null;

    onGrantAdmin: (userId: string) => void;
    onRevokeAdmin: (userId: string) => void;
    onGrantCoach: (userId: string) => void;
    onRevokeCoach: (userId: string) => void;
};

export function UsersTable(props: UsersTableProps) {
    const {
        users,
        actionLoadingUserId,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
    } = props;
    const safeUsers = Array.isArray(users) ? users : [];

    return (
        <div style={usersTableStyles.root}>
            <div style={usersTableStyles.headerRow}>
                <div style={usersTableStyles.colId}>ID</div>
                <div style={usersTableStyles.colMain}>Ник/Телефон</div>
                <div style={usersTableStyles.colRole}>Роль</div>
                <div style={usersTableStyles.colStatus}>Статус</div>
                <div style={usersTableStyles.colActions}>Действие</div>
            </div>

            {safeUsers.map((u) => {
                const isAdmin = u.roleCode === "ADMIN";
                const isCoach = u.roleCode === "COACH";
                const isAthlete = u.roleCode === "ATHLETE";
                const isLoading = actionLoadingUserId === u.id;

                return (
                    <div key={u.id} style={usersTableStyles.row}>
                        <div style={usersTableStyles.colId}>{u.id}</div>

                        <div style={usersTableStyles.colMain}>
                            <div>{u.nickname ?? "—"}</div>
                            <div style={usersTableStyles.subText}>{u.phone ?? "—"}</div>
                        </div>

                        <div style={usersTableStyles.colRole}>{u.roleCode}</div>
                        <div style={usersTableStyles.colStatus}>{u.status}</div>

                        <div style={usersTableStyles.colActions}>
                            {/* Для администраторов: возможность снять админские права и убрать тренерские */}
                            {isAdmin && (
                                <>
                                    <RevokeAdminButton
                                        isLoading={isLoading}
                                        onClick={() => onRevokeAdmin(u.id)}
                                    />
                                    <RevokeCoachButton
                                        isLoading={isLoading}
                                        onClick={() => onRevokeCoach(u.id)}
                                    />
                                </>
                            )}
                            {/* Для тренеров: назначить админом или убрать тренерские права */}
                            {isCoach && (
                                <>
                                    <GrantAdminButton
                                        isLoading={isLoading}
                                        onClick={() => onGrantAdmin(u.id)}
                                    />
                                    <RevokeCoachButton
                                        isLoading={isLoading}
                                        onClick={() => onRevokeCoach(u.id)}
                                    />
                                </>
                            )}
                            {/* Для атлетов: возможность назначить тренером или сразу админом */}
                            {isAthlete && (
                                <>
                                    <GrantCoachButton
                                        isLoading={isLoading}
                                        onClick={() => onGrantCoach(u.id)}
                                    />
                                    <GrantAdminButton
                                        isLoading={isLoading}
                                        onClick={() => onGrantAdmin(u.id)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
