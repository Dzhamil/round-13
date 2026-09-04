import { type FormEvent, useState } from "react";
import { setWebPassword } from "../../../../../shared/api/account.api";
import ErrorText from "../../../../../shared/ui/ErrorText";
import { ProfileActionButton } from "../ProfileActionButton/ProfileActionButton";
import { deleteAccountModalStyles as s } from "../../../styles/deleteAccountModal.styles";

type Props = { isOpen: boolean; configured: boolean; onClose: () => void; onSaved: () => void };

export function WebPasswordModal({ isOpen, configured, onClose, onSaved }: Props) {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (password !== confirmation) {
            setError("Пароли не совпадают");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await setWebPassword(password, confirmation);
            setPassword("");
            setConfirmation("");
            onSaved();
            onClose();
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? "Не удалось сохранить пароль");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={s.backdrop} role="presentation" onClick={loading ? undefined : onClose} data-swipe-back-exclude>
            <form style={s.modal} onSubmit={(event) => void submit(event)} onClick={(event) => event.stopPropagation()}>
                <div style={s.title}>{configured ? "Сменить пароль" : "Создать пароль для входа"}</div>
                <p style={s.text}>Пароль используется для входа в web-версию по телефону. Старый пароль не требуется.</p>
                <div style={{ display: "grid", gap: 10 }}>
                    <input type="password" minLength={8} maxLength={72} required autoComplete="new-password" placeholder="Новый пароль" value={password} onChange={(event) => setPassword(event.target.value)} style={{ padding: 12, borderRadius: 10, fontSize: 16 }} />
                    <input type="password" minLength={8} maxLength={72} required autoComplete="new-password" placeholder="Повторите пароль" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} style={{ padding: 12, borderRadius: 10, fontSize: 16 }} />
                </div>
                {error && <ErrorText message={error} />}
                <div style={s.actions}>
                    <ProfileActionButton variant="secondary" onClick={onClose} disabled={loading} fullWidth>Отмена</ProfileActionButton>
                    <ProfileActionButton type="submit" disabled={loading} fullWidth>{loading ? "Сохраняем..." : "Сохранить"}</ProfileActionButton>
                </div>
            </form>
        </div>
    );
}
