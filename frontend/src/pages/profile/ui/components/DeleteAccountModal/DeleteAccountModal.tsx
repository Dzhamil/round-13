import ErrorText from "../../../../../shared/ui/ErrorText";
import { deleteAccountModalStyles as s } from "../../../styles/deleteAccountModal.styles";
import { ProfileActionButton } from "../ProfileActionButton/ProfileActionButton";

type Props = {
    isOpen: boolean;
    confirmed: boolean;
    loading: boolean;
    error: string | null;
    onConfirmedChange: (confirmed: boolean) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteAccountModal({
    isOpen,
    confirmed,
    loading,
    error,
    onConfirmedChange,
    onClose,
    onConfirm,
}: Props) {
    if (!isOpen) return null;

    return (
        <div style={s.backdrop} onClick={loading ? undefined : onClose} role="presentation" data-swipe-back-exclude>
            <div
                style={s.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
            >
                <div id="delete-account-title" style={s.title}>
                    Деактивация профиля
                </div>

                <p style={s.text}>
                    Профиль будет деактивирован, а текущая сессия завершится.
                </p>

                <ul style={s.list}>
                    <li style={s.item}>Аккаунт перестанет появляться в обычных списках участников и профилях.</li>
                    <li style={s.item}>История тренировок и заказов может остаться в клубных записях.</li>
                    <li style={s.item}>Вход с тем же Telegram-аккаунтом не создаст новый профиль автоматически.</li>
                </ul>

                <label style={s.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={confirmed}
                        disabled={loading}
                        onChange={(event) => onConfirmedChange(event.target.checked)}
                        style={s.checkbox}
                    />
                    <span style={s.checkboxText}>
                        Я понимаю, что профиль будет деактивирован, а доступ к аккаунту завершится.
                    </span>
                </label>

                {error && <ErrorText message={error} />}

                <div style={s.actions}>
                    <ProfileActionButton variant="secondary" onClick={onClose} disabled={loading} fullWidth>
                        Отмена
                    </ProfileActionButton>
                    <ProfileActionButton
                        variant="danger"
                        onClick={onConfirm}
                        disabled={!confirmed || loading}
                        fullWidth
                    >
                        {loading ? "Деактивируем..." : "Деактивировать профиль"}
                    </ProfileActionButton>
                </div>
            </div>
        </div>
    );
}
