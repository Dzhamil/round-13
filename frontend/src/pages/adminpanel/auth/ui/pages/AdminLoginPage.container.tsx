import { useNavigate } from "react-router-dom";
import { appStyles } from "../../../../../app/app.styles";
import { usePanelLogin } from "../../model/usePanelLogin";
import { AdminLoginForm } from "../components/AdminLoginForm/AdminLoginForm";

export function AdminLoginPageContainer() {
    const navigate = useNavigate();
    const { login, password, isLoading, error, setLogin, setPassword, submit } = usePanelLogin();

    async function handleSubmit(): Promise<void> {
        const isAuthenticated = await submit();
        if (!isAuthenticated) return;

        navigate("/admin/users", { replace: true });
    }

    return (
        <div style={appStyles.section}>
            <AdminLoginForm
                login={login}
                password={password}
                isLoading={isLoading}
                error={error}
                onLoginChange={setLogin}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default AdminLoginPageContainer;
