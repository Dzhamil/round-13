import { profilePageStyles as s } from "../../../styles/profilePage.styles";

type SubscribeButtonProps = {
    isSubscribed: boolean;
    onToggle?: () => void;
};

/**
 * Кнопка подписки на ученика клуба.
 *
 * Пока без интеграции с API: состояние приходит из пропсов,
 * событие отдаём наверх через onToggle.
 */
export function SubscribeButton({ isSubscribed, onToggle }: SubscribeButtonProps) {
    const label = isSubscribed ? "Отписаться" : "Подписаться";

    return (
        <button
            type="button"
            onClick={() => onToggle?.()}
            style={s.button(isSubscribed)}
        >
            {label}
        </button>
    );
}
