// frontend/src/pages/timetable/ui/components/TrainingInfoModal/TrainingInfoModal.tsx

import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import {
    formatTrainingTimeRange,
    getTrainingLocation,
    getTrainingPrimaryLabel,
    getTrainingSecondaryLabel,
} from "../../../model/timetableTrainingDisplay";
import { trainingInfoModalStyles as s } from "./trainingInfoModal.styles";

type Props = {
    open: boolean;
    item: MyScheduleItem | TrainerScheduleItem | null;
    isCoach: boolean;
    onClose: () => void;
    onRequestCancel?: (item: MyScheduleItem) => void | Promise<void>;
    onMarkAttended?: (item: TrainerScheduleItem) => void | Promise<void>;
    onMarkNoShow?: (item: TrainerScheduleItem) => void | Promise<void>;
    onCancelByTrainer?: (item: TrainerScheduleItem) => void | Promise<void>;
    submittingCancel?: boolean;
    submittingAttendance?: boolean;
    submittingNoShow?: boolean;
    submittingCoachCancel?: boolean;
};

function getStatusLabel(status?: string | null): string | null {
    if (!status) return null;
    if (status === "BOOKED") return "Записан";
    if (status === "CANCEL_REQUESTED") return "Запрос на отмену отправлен";
    if (status === "CANCELLED_FREE") return "Отменено без списания";
    if (status === "CANCELLED_LATE") return "Отменено со списанием";
    if (status === "CANCELLED_BY_TRAINER") return "Тренировка отменена тренером";
    if (status === "ATTENDED") return "Тренировка посещена";
    if (status === "NO_SHOW") return "Неявка";
    return status;
}

function canShowMarkAttended(item: TrainerScheduleItem): boolean {
    if (item.canMarkAttended) {
        return true;
    }
    if (item.status !== "BOOKED") {
        return false;
    }

    const startsAt = new Date(item.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
        return false;
    }

    return startsAt.getTime() <= Date.now();
}

function canShowMarkNoShow(item: TrainerScheduleItem): boolean {
    if (item.canMarkNoShow) {
        return true;
    }
    if (item.status !== "BOOKED") {
        return false;
    }

    const startsAt = new Date(item.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
        return false;
    }

    return startsAt.getTime() <= Date.now();
}

function canShowCoachCancel(item: TrainerScheduleItem): boolean {
    if (item.canCancelByTrainer) {
        return true;
    }
    if (item.status !== "BOOKED" && item.status !== "CANCEL_REQUESTED") {
        return false;
    }

    const startsAt = new Date(item.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
        return false;
    }

    return startsAt.getTime() > Date.now();
}

export function TrainingInfoModal({
    open,
    item,
    isCoach,
    onClose,
    onRequestCancel,
    onMarkAttended,
    onMarkNoShow,
    onCancelByTrainer,
    submittingCancel = false,
    submittingAttendance = false,
    submittingNoShow = false,
    submittingCoachCancel = false,
}: Props) {
    if (!open || !item) {
        return null;
    }

    const title = getTrainingPrimaryLabel(item, isCoach);
    const time = formatTrainingTimeRange(item);
    const nameLabel = getTrainingSecondaryLabel(item, isCoach);
    const location = getTrainingLocation(item);
    const currentStatus = getStatusLabel((item as MyScheduleItem | TrainerScheduleItem).status);

    return (
        <div data-swipe-back-exclude style={s.overlay}>
            <div style={s.modal} role="dialog" aria-modal="true">
                <button
                    type="button"
                    style={s.close}
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <div style={s.title}>{title}</div>

                <div style={s.row}>
                    Время: {time}
                </div>

                {nameLabel ? (
                    <div style={s.row}>
                        {nameLabel}
                    </div>
                ) : null}

                {location ? (
                    <div style={s.row}>
                        Место: {location}
                    </div>
                ) : null}

                {currentStatus ? (
                    <div style={s.row}>
                        Статус: {currentStatus}
                    </div>
                ) : null}

                <div style={s.actions}>
                    {!isCoach && (item as MyScheduleItem).canCancel ? (
                        <button
                            type="button"
                            style={s.requestCancel}
                            onClick={() => {
                                void onRequestCancel?.(item as MyScheduleItem);
                            }}
                            disabled={submittingCancel}
                        >
                            {submittingCancel ? "Отправляем..." : "Запросить отмену"}
                        </button>
                    ) : null}
                    {isCoach && canShowMarkAttended(item as TrainerScheduleItem) ? (
                        <button
                            type="button"
                            style={s.requestCancel}
                            onClick={() => {
                                void onMarkAttended?.(item as TrainerScheduleItem);
                            }}
                            disabled={submittingAttendance}
                        >
                            {submittingAttendance ? "Сохраняем..." : "Отметить посещение"}
                        </button>
                    ) : null}
                    {isCoach && canShowMarkNoShow(item as TrainerScheduleItem) ? (
                        <button
                            type="button"
                            style={s.dangerButton}
                            onClick={() => {
                                void onMarkNoShow?.(item as TrainerScheduleItem);
                            }}
                            disabled={submittingNoShow}
                        >
                            {submittingNoShow ? "Сохраняем..." : "Отметить неявку"}
                        </button>
                    ) : null}
                    {isCoach && canShowCoachCancel(item as TrainerScheduleItem) ? (
                        <button
                            type="button"
                            style={s.dangerButton}
                            onClick={() => {
                                void onCancelByTrainer?.(item as TrainerScheduleItem);
                            }}
                            disabled={submittingCoachCancel}
                        >
                            {submittingCoachCancel ? "Сохраняем..." : "Отменить тренировку тренером"}
                        </button>
                    ) : null}
                </div>

            </div>
        </div>
    );
}
