import { profileCompletenessBadgeStyles as s } from "./profileCompletenessBadge.styles";

type ProfileCompletenessBadgeProps = {
    isComplete: boolean;
};

/**
 * Бейдж заполненности профиля.
 *
 * Логику определения заполненности держим вне компонента (в page/model),
 * тут только отображение состояния.
 */
export function ProfileCompletenessBadge({ isComplete }: ProfileCompletenessBadgeProps) {
    if (isComplete) return null;

    return <div style={s.root}>Профиль не заполнен — добавьте данные</div>;
}
