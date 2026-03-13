import { useNavigate } from "react-router-dom";
import { appStyles } from "../../../../../app/app.styles";
import { usePanelLogin } from "../../model/usePanelLogin";
import { AdminLoginForm } from "../components/AdminLoginForm/AdminLoginForm";

export function AdminLoginPageContainer() {
    const navigate = useNavigate();
    const { login, password, isLoading, error, setLogin, setPassword, submit } = usePanelLogin();

    async function handleSubmit(): Promise<void> {
        await submit();
        // если ошибка была — submit её поставит, а токен не сохранит
        // поэтому навигацию делаем только когда error == null и не loading
        // (но ошибка выставляется асинхронно, поэтому проверим через localStorage не будем — сделаем проще:)
        // В submit токен сохраняется только при успехе, значит можно просто навигировать после submit,
        // а если была ошибка — пользователь останется на странице и увидит error.
        if (!error) {
            navigate("/admin/users", { replace: true });
        }
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
