import { profileEmptyStateStyles as s } from "./profileEmptyState.styles";

type ProfileEmptyStateProps = {
    title?: string;
    description?: string;
};

/**
 * Пустое состояние профиля (нет данных / профиль не заполнен / не найден).
 *
 * UI-компонент без логики — решение "показывать или нет" остаётся на странице.
 */
export function ProfileEmptyState({
                                      title = "Профиль недоступен",
                                      description = "Данные профиля пока не загружены или не заполнены.",
                                  }: ProfileEmptyStateProps) {
    return (
        <div style={s.root}>
            <h2 style={s.title}>{title}</h2>
            <p style={s.description}>{description}</p>
        </div>
    );
}
