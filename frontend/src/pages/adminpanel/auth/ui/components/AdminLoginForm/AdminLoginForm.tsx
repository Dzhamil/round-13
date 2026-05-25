import ErrorText from "../../../../../../shared/ui/ErrorText";
import * as S from "../../styles/AdminLoginForm.styles";

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
        <S.Root>
            <S.Title>Вход в админ-панель</S.Title>

            <S.FieldLabel>
                Логин
                <S.TextInput
                    value={login}
                    onChange={(e) => onLoginChange(e.target.value)}
                />
            </S.FieldLabel>

            <S.FieldLabel>
                Пароль
                <S.TextInput
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                />
            </S.FieldLabel>

            <S.SubmitButton type="button" onClick={onSubmit} disabled={isLoading}>
                {isLoading ? "Входим..." : "Войти"}
            </S.SubmitButton>

            {error && (
                <S.ErrorSlot>
                    <ErrorText message={error} />
                </S.ErrorSlot>
            )}
        </S.Root>
    );
}
