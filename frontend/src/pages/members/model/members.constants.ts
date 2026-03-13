import type { StudentOperationalStatusCode } from "./members.types";

export const OPERATIONAL_STATUS_LABELS: Record<StudentOperationalStatusCode, string> = {
    ACTIVE: "Активный",
    RISK: "Требует внимания",
    LONG_ABSENT: "Давно не был",
};

export const TRAINING_STATUS_LABELS: Record<string, string> = {
    BOOKED: "Записан",
    CANCEL_REQUESTED: "Просит отмену",
    CANCELLED_FREE: "Отменил заранее",
    CANCELLED_LATE: "Поздняя отмена",
    CANCELLED_BY_TRAINER: "Отменено тренером",
    ATTENDED: "Посетил",
    NO_SHOW: "Не пришел",
};

export const BALANCE_EVENT_TITLES: Record<string, string> = {
    LATE_CANCEL_DEBIT: "Списание за позднюю отмену",
    ATTENDED_DEBIT: "Списание за посещение",
    NO_SHOW_DEBIT: "Списание за неявку",
    MANUAL_ADD: "Ручное начисление",
    MANUAL_DEBIT: "Ручное списание",
};

export const MEMBER_DETAILS_TEXT = {
    loadError: "Не удалось загрузить карточку участника",
    addStudentError: "Не удалось добавить ученика",
    removeStudentError: "Не удалось убрать ученика",
    updateBalanceError: "Не удалось обновить остаток тренировок",
    updateNoteError: "Не удалось сохранить заметку",
    loading: "Загружаем карточку ученика…",
    refreshing: "Обновляем данные…",
    statsTitle: "Профиль и статистика",
    aboutTitle: "О себе",
    coachCardTitle: "Операционный блок тренера",
    coachCardEmpty: "Добавьте ученика в работу, чтобы вести заметки, баланс и видеть последние тренировки.",
    noteTitle: "Приватная заметка",
    noteEmpty: "Сюда удобно записывать ограничения, договоренности, задачи на ближайшие тренировки и важные бытовые детали.",
    notePlaceholder: "Например: беречь колено, проверить дыхание на лапах, напомнить про оплату пакета.",
    noteMetaFallback: "Еще не обновлялась",
    balanceTitle: "Баланс тренировок",
    balanceHistoryEmpty: "Изменений баланса пока нет.",
    trainingsTitle: "Последние тренировки",
    trainingHistoryTitle: "История тренировок",
    trainingsEmpty: "У этого ученика пока нет зафиксированных тренировок с вами.",
    nextTrainingLabel: "Ближайшая тренировка",
    noNextTraining: "Ближайшей записи пока нет",
    historyTab: "История",
    overviewTab: "Обзор",
    allHistory: "Вся история",
    historyEmpty: "История по ученику пока пустая.",
    openFullHistory: "Развернуть всю историю",
    retry: "Повторить",
    addStudent: "Добавить в ученики",
    removeStudent: "Убрать из учеников",
    editNote: "Редактировать заметку",
    addNote: "Добавить заметку",
    cancel: "Отмена",
    saveNote: "Сохранить заметку",
    saveBalance: "Сохранить остаток",
    lastUpdatedPrefix: "Обновил",
};
