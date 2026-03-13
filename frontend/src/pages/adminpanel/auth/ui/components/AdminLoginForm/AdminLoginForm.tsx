import { Button } from "../../../../../../shared/ui/Button";
import ErrorText from "../../../../../../shared/ui/ErrorText";
import { adminLoginFormStyles } from "../../styles/AdminLoginForm.styles";

export type AdminLoginFormProps = {
    login: string;
    password: string;
    isLoading: boolean;
    error: string | null;

    onLoginChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
};

export function AdminLoginForm(props: AdminLoginFormProps) {
    const {
        login,
        password,
        isLoading,
        error,
        onLoginChange,
        onPasswordChange,
        onSubmit,
    } = props;

    return (
        <div style={adminLoginFormStyles.root}>
            <h2 style={adminLoginFormStyles.title}>Вход в админ-панель</h2>

            <label style={adminLoginFormStyles.label}>
                Логин
                <input
                    style={adminLoginFormStyles.input}
                    value={login}
                    onChange={(e) => onLoginChange(e.target.value)}
                />
            </label>

            <label style={adminLoginFormStyles.label}>
                Пароль
                <input
                    style={adminLoginFormStyles.input}
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                />
            </label>

            <Button onClick={onSubmit} disabled={isLoading} fullWidth>
                {isLoading ? "Входим..." : "Войти"}
            </Button>

            {error && <ErrorText message={error} />}
        </div>
    );
}
