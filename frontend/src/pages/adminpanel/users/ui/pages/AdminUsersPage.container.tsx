import { FormEvent, useState } from "react";

import ErrorText from "../../../../../shared/ui/ErrorText";

import { UsersTable } from "../components/UsersTable/UsersTable";
import { usePanelUsers } from "../../model/usePanelUsers";
import * as S from "../styles/AdminUsersPage.styles";
import { createManualUser, ManualUserRequest } from "../../api/panelUsers.api";
import { extractPanelErrorMessage } from "../../../shared/lib/panelApiError";
import { IssuedPasswordNotice } from "../components/IssuedPasswordNotice/IssuedPasswordNotice";

const INITIAL_FORM: Required<ManualUserRequest> = {
    surname: "",
    firstName: "",
    patronymic: "",
    phone: "",
    telegramNickname: "",
    password: "",
    generatePassword: true,
    roleCode: "ATHLETE",
};

export function AdminUsersPageContainer() {
    const [createOpen, setCreateOpen] = useState(false);
    const [issuedPassword, setIssuedPassword] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);

    const {
        onBlock,
        onUnblock,
        onDelete,
        users,
        isLoading,
        error,
        actionLoadingUserId,
        reload,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
        issuedTemporaryPassword,
        onResetTemporaryPassword,
        clearIssuedTemporaryPassword,
    } = usePanelUsers();

    async function create(event: FormEvent): Promise<void> {
        event.preventDefault();
        setCreateError(null);
        setIssuedPassword(null);

        if (![form.surname, form.firstName, form.patronymic].every(value => value.trim())) {
            setCreateError("Заполните фамилию, имя и отчество.");
            return;
        }

        const request: ManualUserRequest = form.generatePassword
            ? { ...form, password: undefined }
            : form;

        try {
            const result = await createManualUser(request);
            setIssuedPassword(result.issuedPassword);
            await reload();
        } catch (error) {
            setCreateError(extractPanelErrorMessage(error, "Не удалось создать пользователя"));
        }
    }

    function resetTemporaryPassword(userId: string): void {
        const confirmed = window.confirm(
            "Сбросить пароль пользователя? Старый пароль сразу перестанет работать.",
        );
        if (confirmed) {
            void onResetTemporaryPassword(userId);
        }
    }

    return (
        <>
            {isLoading && <S.Loading>Загрузка…</S.Loading>}

            {error && (
                <S.ErrorSlot>
                    <ErrorText message={error} />
                </S.ErrorSlot>
            )}
            <button onClick={()=>setCreateOpen(v=>!v)} style={{padding:10,borderRadius:10}}>+ Создать пользователя вручную</button>
            {createOpen&&<form onSubmit={create} style={{display:"grid",gap:8,padding:12,border:"1px solid #ffffff22",borderRadius:12}}>
                <input required placeholder="Фамилия" value={form.surname} onChange={e=>setForm({...form,surname:e.target.value})}/>
                <input required placeholder="Имя" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
                <input required placeholder="Отчество" value={form.patronymic} onChange={e=>setForm({...form,patronymic:e.target.value})}/>
                <input required placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                <input placeholder="Telegram nickname" value={form.telegramNickname} onChange={e=>setForm({...form,telegramNickname:e.target.value})}/>
                <label><input type="checkbox" checked={form.generatePassword} onChange={e=>setForm({...form,generatePassword:e.target.checked})}/> Сгенерировать пароль</label>
                {!form.generatePassword&&<input required minLength={8} type="password" placeholder="Пароль" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>}
                <select value={form.roleCode} onChange={e=>setForm({...form,roleCode:e.target.value})}><option value="ATHLETE">Ученик</option><option value="COACH">Тренер</option><option value="ADMIN">Администратор</option></select>
                <button>Создать</button>
                {issuedPassword && <IssuedPasswordNotice password={issuedPassword} />}
                {createError&&<span>{createError}</span>}
            </form>}

            {issuedTemporaryPassword && (
                <IssuedPasswordNotice
                    password={issuedTemporaryPassword.password}
                    onDismiss={clearIssuedTemporaryPassword}
                />
            )}

            <UsersTable
                users={users}
                showCountSummary={!isLoading && !error}
                onBlock={onBlock}
                onUnblock={onUnblock}
                onDelete={onDelete}
                actionLoadingUserId={actionLoadingUserId}
                onGrantAdmin={onGrantAdmin}
                onRevokeAdmin={onRevokeAdmin}
                onGrantCoach={onGrantCoach}
                onRevokeCoach={onRevokeCoach}
                onResetTemporaryPassword={resetTemporaryPassword}
            />
        </>
    );
}

export default AdminUsersPageContainer;
