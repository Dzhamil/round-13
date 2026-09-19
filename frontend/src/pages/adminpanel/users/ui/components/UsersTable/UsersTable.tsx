import { useMemo, useState } from "react";
import { displayUserValue, sortUsers, userFullName, USER_SORT_COLUMNS, type UserSort, type UserSortKey } from "../../../model/userTableValues";
import type { PanelUserListItem } from "../../../api/panelUsers.api";
import * as S from "../../styles/UsersTable.styles";
import { GrantAdminButton } from "../GrantAdminButton/GrantAdminButton";
import { RevokeAdminButton } from "../RevokeAdminButton/RevokeAdminButton";
import { GrantCoachButton } from "../GrantCoachButton/GrantCoachButton";
import { RevokeCoachButton } from "../RevokeCoachButton/RevokeCoachButton";
import { ResetTemporaryPasswordButton } from "../ResetTemporaryPasswordButton/ResetTemporaryPasswordButton";

export type UsersTableProps = {
    users: PanelUserListItem[];
    actionLoadingUserId: string | null;

    onGrantAdmin: (userId: string) => void;
    onRevokeAdmin: (userId: string) => void;
    onGrantCoach: (userId: string) => void;
    onRevokeCoach: (userId: string) => void;
    onResetTemporaryPassword: (userId: string) => void;
};

export function UsersTable(props: UsersTableProps) {
    const {
        users,
        actionLoadingUserId,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
        onResetTemporaryPassword,
    } = props;
    const [sort, setSort] = useState<UserSort | null>(null);
    const [coachesOnly, setCoachesOnly] = useState(false);
    const coaches = useMemo(() => users.filter(user => user.coach), [users]);
    const sortedUsers = useMemo(() => sortUsers(coachesOnly ? coaches : users, sort), [users, coaches, coachesOnly, sort]);
    function toggleSort(key: UserSortKey) {
        setSort(current => ({ key, direction: current?.key === key && current.direction === "asc" ? "desc" : "asc" }));
    }

    return (
        <S.Root>
            <label>
                <input type="checkbox" checked={coachesOnly} onChange={event => setCoachesOnly(event.target.checked)} />
                Тренеры ({coaches.length})
            </label>
            <S.MobileSort>
                <label>Сортировка
                    <select aria-label="Сортировка" value={sort?.key ?? ""}
                        onChange={e => setSort(e.target.value ? { key: e.target.value as UserSortKey, direction: "asc" } : null)}>
                        <option value="">Исходный порядок</option>
                        {USER_SORT_COLUMNS.map(column => <option key={column.key} value={column.key}>{column.label}</option>)}
                    </select>
                </label>
                {sort && <button onClick={() => toggleSort(sort.key)} aria-label="Изменить направление сортировки">
                    {sort.direction === "asc" ? "По возрастанию ↑" : "По убыванию ↓"}
                </button>}
            </S.MobileSort>
            <S.HeaderRow>
                <S.HeaderCell>ID</S.HeaderCell>
                {USER_SORT_COLUMNS.map(column => (
                    <S.HeaderCell key={column.key}>
                        <S.SortButton onClick={() => toggleSort(column.key)}
                            aria-label={`Сортировать: ${column.label}`}>
                            {column.label} {sort?.key === column.key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                        </S.SortButton>
                    </S.HeaderCell>
                ))}
                <S.HeaderCell>Действие</S.HeaderCell>
            </S.HeaderRow>

            {sortedUsers.map((u) => {
                const isAdmin = u.roleCode === "ADMIN";
                const isCoach = u.coach && !isAdmin;
                const isAthlete = u.roleCode === "ATHLETE";
                const isLoading = actionLoadingUserId === u.id;

                return (
                    <S.Row key={u.id}>
                        <S.IdCell data-label="ID">{u.id}</S.IdCell>

                        <S.Cell data-label="ФИО">{displayUserValue(userFullName(u))}</S.Cell>
                        <S.Cell data-label="Ник">{displayUserValue(u.nickname)}</S.Cell>
                        <S.Cell data-label="Телефон">{displayUserValue(u.phone)}</S.Cell>
                        <S.Cell data-label="Роль">{u.coach ? (isAdmin ? "Тренер · ADMIN" : "Тренер · COACH") : displayUserValue(u.roleCode)}</S.Cell>
                        <S.Cell data-label="Статус">{displayUserValue(u.status)}</S.Cell>

                        <S.ActionsCell data-label="Действие">
                            <ResetTemporaryPasswordButton
                                isLoading={isLoading}
                                onClick={() => onResetTemporaryPassword(u.id)}
                            />
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
