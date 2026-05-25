import type { PanelUserListItem } from "../../../api/panelUsers.api";
import * as S from "../../styles/UsersTable.styles";
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
        <S.Root>
            <S.HeaderRow>
                <S.HeaderCell>ID</S.HeaderCell>
                <S.HeaderCell>Ник/Телефон</S.HeaderCell>
                <S.HeaderCell>Роль</S.HeaderCell>
                <S.HeaderCell>Статус</S.HeaderCell>
                <S.HeaderCell>Действие</S.HeaderCell>
            </S.HeaderRow>

            {safeUsers.map((u) => {
                const isAdmin = u.roleCode === "ADMIN";
                const isCoach = u.roleCode === "COACH";
                const isAthlete = u.roleCode === "ATHLETE";
                const isLoading = actionLoadingUserId === u.id;

                return (
                    <S.Row key={u.id}>
                        <S.IdCell data-label="ID">{u.id}</S.IdCell>

                        <S.MainCell data-label="Ник/Телефон">
                            <div>{u.nickname ?? "—"}</div>
                            <S.SubText>{u.phone ?? "—"}</S.SubText>
                        </S.MainCell>

                        <S.Cell data-label="Роль">{u.roleCode}</S.Cell>
                        <S.Cell data-label="Статус">{u.status}</S.Cell>

                        <S.ActionsCell data-label="Действие">
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
                        </S.ActionsCell>
                    </S.Row>
                );
            })}
        </S.Root>
    );
}
