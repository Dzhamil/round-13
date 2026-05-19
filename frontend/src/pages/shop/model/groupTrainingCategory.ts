import type { ShopCategoryResponse } from "../api/category.api";

const GROUP_TRAINING_CATEGORY_TITLE = "групповая тренировка";

export const GROUP_TRAINING_EMPTY_STATE = {
    title: "Групповые тренировки пока недоступны",
    body: "Сейчас нет активных пакетов для групповых занятий. Вернитесь позже или напишите администратору клуба.",
    actionLabel: "Назад в магазин",
    unavailableLabel: "Нет доступных пакетов",
    adminHint: "Для продажи групповых тренировок добавьте активный товар в эту категорию с типом TRAININGS и начислением GROUP_TRAININGS.",
} as const;

export function isGroupTrainingCategory(
    category: Pick<ShopCategoryResponse, "title" | "type">
): boolean {
    return category.type === "TRAININGS"
        && category.title.trim().toLocaleLowerCase("ru-RU") === GROUP_TRAINING_CATEGORY_TITLE;
}

export function getCategoryAvailabilityLabel(
    category: Pick<ShopCategoryResponse, "title" | "type">,
    activeItemsCount: number
): string {
    if (isGroupTrainingCategory(category) && activeItemsCount === 0) {
        return GROUP_TRAINING_EMPTY_STATE.unavailableLabel;
    }

    return `Доступно: ${activeItemsCount}`;
}
