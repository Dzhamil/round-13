import { useNavigate } from "react-router-dom";
import { usePanelLogin } from "../../model/usePanelLogin";
import { AdminLoginForm } from "../components/AdminLoginForm/AdminLoginForm";
import * as S from "../styles/AdminLoginForm.styles";

export function AdminLoginPageContainer() {
    const navigate = useNavigate();
    const { login, password, isLoading, error, setLogin, setPassword, submit } = usePanelLogin();

    async function handleSubmit(): Promise<void> {
        const isAuthenticated = await submit();
        if (!isAuthenticated) return;

        navigate("/admin/users", { replace: true });
    }

    return (
        <S.LoginPage>
            <S.LoginPanelFrame>
                <AdminLoginForm
                    login={login}
                    password={password}
                    isLoading={isLoading}
                    error={error}
                    onLoginChange={setLogin}
                    onPasswordChange={setPassword}
                    onSubmit={handleSubmit}
                />
            </S.LoginPanelFrame>
        </S.LoginPage>
    );
}

export default AdminLoginPageContainer;
