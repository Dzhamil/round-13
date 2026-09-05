import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorText from "../../../../../shared/ui/ErrorText";
import PanelLogoutButton from "../../../shared/ui/components/PanelLogoutButton/PanelLogoutButton";
import PanelAdminNav from "../../../shared/ui/components/PanelAdminNav/PanelAdminNav";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";

import { UsersTable } from "../components/UsersTable/UsersTable";
import { usePanelUsers } from "../../model/usePanelUsers";
import * as S from "../styles/AdminUsersPage.styles";
import { createManualUser, ManualUserRequest } from "../../api/panelUsers.api";
import { extractPanelErrorMessage } from "../../../shared/lib/panelApiError";

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
    const navigate = useNavigate();
    const [createOpen, setCreateOpen] = useState(false);
    const [issuedPassword, setIssuedPassword] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);

    const {
        users,
        isLoading,
        error,
        actionLoadingUserId,
        reload,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
    } = usePanelUsers();

    async function create(event: FormEvent): Promise<void> {
        event.preventDefault();
        setCreateError(null);
        setIssuedPassword(null);

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
                <button onClick={()=>setCreateOpen(v=>!v)} style={{padding:10,borderRadius:10}}>+ Создать пользователя вручную</button>
                {createOpen&&<form onSubmit={create} style={{display:"grid",gap:8,padding:12,border:"1px solid #ffffff22",borderRadius:12}}>
                    <input required placeholder="Фамилия" value={form.surname} onChange={e=>setForm({...form,surname:e.target.value})}/>
                    <input required placeholder="Имя" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
                    <input placeholder="Отчество" value={form.patronymic} onChange={e=>setForm({...form,patronymic:e.target.value})}/>
                    <input required placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                    <input placeholder="Telegram nickname" value={form.telegramNickname} onChange={e=>setForm({...form,telegramNickname:e.target.value})}/>
                    <label><input type="checkbox" checked={form.generatePassword} onChange={e=>setForm({...form,generatePassword:e.target.checked})}/> Сгенерировать пароль</label>
                    {!form.generatePassword&&<input required minLength={8} type="password" placeholder="Пароль" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>}
                    <select value={form.roleCode} onChange={e=>setForm({...form,roleCode:e.target.value})}><option value="ATHLETE">Ученик</option><option value="COACH">Тренер</option><option value="ADMIN">Администратор</option></select>
                    <button>Создать</button>{issuedPassword&&<strong>Выданный пароль: {issuedPassword}</strong>}{createError&&<span>{createError}</span>}
                </form>}

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
