import { ActionButton } from "../../styles/AdminButtons.styles";
import { useMemo, useState } from "react";
import { displayUserValue, isUserAdmin, sortUsers, userFullName, USER_SORT_COLUMNS, type UserSort, type UserSortKey } from "../../../model/userTableValues";
import type { PanelUserListItem } from "../../../api/panelUsers.api";
import * as S from "../../styles/UsersTable.styles";
import { GrantAdminButton } from "../GrantAdminButton/GrantAdminButton";
import { RevokeAdminButton } from "../RevokeAdminButton/RevokeAdminButton";
import { GrantCoachButton } from "../GrantCoachButton/GrantCoachButton";
import { RevokeCoachButton } from "../RevokeCoachButton/RevokeCoachButton";
import { ResetTemporaryPasswordButton } from "../ResetTemporaryPasswordButton/ResetTemporaryPasswordButton";

export type UsersTableProps = {
    users: PanelUserListItem[];
    onBlock: (userId: string) => void;
    onUnblock: (userId: string) => void;
    onDelete: (userId: string) => void;
    actionLoadingUserId: string | null;

    onGrantAdmin: (userId: string) => void;
    onRevokeAdmin: (userId: string) => void;
    onGrantCoach: (userId: string) => void;
    onRevokeCoach: (userId: string) => void;
    onResetTemporaryPassword: (userId: string) => void;
};

export function UsersTable(props: UsersTableProps) {
    const {
        onBlock,
        onUnblock,
        onDelete,
        users,
        actionLoadingUserId,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
        onResetTemporaryPassword,
    } = props;
    const [sort, setSort] = useState<UserSort | null>(null);
    const sortedUsers = useMemo(() => sortUsers(users, sort), [users, sort]);
    function toggleSort(key: UserSortKey) {
        setSort(current => ({ key, direction: current?.key === key && current.direction === "asc" ? "desc" : "asc" }));
    }

    return (
        <S.Root>
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
                const isAdmin = isUserAdmin(u);
                const isCoach = u.trainer;
                const isLoading = actionLoadingUserId !== null;

                return (
                    <S.Row key={u.id}>
                        <S.IdCell data-label="ID">{u.id}</S.IdCell>

                        <S.Cell data-label="ФИО">{displayUserValue(userFullName(u))}</S.Cell>
                        <S.Cell data-label="Ник">{displayUserValue(u.nickname)}</S.Cell>
                        <S.Cell data-label="Телефон">{displayUserValue(u.phone)}</S.Cell>
                        <S.Cell data-label="Админ">{isAdmin ? "Да" : "Нет"}</S.Cell>
                        <S.Cell data-label="Тренер">{isCoach ? "Да" : "Нет"}</S.Cell>
                        <S.Cell data-label="Статус">{displayUserValue(u.status)}</S.Cell>

                        <S.ActionsCell data-label="Действие">
                            <ActionButton disabled={isLoading} onClick={() =>
                                u.status === "BLOCKED" ? onUnblock(u.id) : onBlock(u.id)}>
                                {u.status === "BLOCKED" ? "Разблокировать" : "Заблокировать"}
                            </ActionButton>
                            <ActionButton $tone="danger" disabled={isLoading} onClick={() => {
                                if (window.confirm(`Полностью удалить пользователя ${userFullName(u) || u.nickname || u.id}? Пользователь будет удалён из приложения и при новом входе будет регистрироваться заново. Отменить удаление нельзя.`)) {
                                    onDelete(u.id);
                                }
                            }}>Удалить</ActionButton>
                            <ResetTemporaryPasswordButton
                                isLoading={isLoading}
                                onClick={() => onResetTemporaryPassword(u.id)}
                            />
                            {isAdmin ? (
                                <RevokeAdminButton isLoading={isLoading} onClick={() => onRevokeAdmin(u.id)} />
                            ) : (
                                <GrantAdminButton isLoading={isLoading} onClick={() => onGrantAdmin(u.id)} />
                            )}
                            {isCoach ? (
                                <RevokeCoachButton isLoading={isLoading} onClick={() => onRevokeCoach(u.id)} />
                            ) : (
                                <GrantCoachButton isLoading={isLoading} onClick={() => onGrantCoach(u.id)} />
                            )}
                        </S.ActionsCell>
                    </S.Row>
                );
            })}
        </S.Root>
    );
}
