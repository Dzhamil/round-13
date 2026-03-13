// frontend/src/pages/timetable/ui/components/TrainingInfoModal/TrainingInfoModal.tsx

import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import { trainingInfoModalStyles as s } from "./trainingInfoModal.styles";

type Props = {
    open: boolean;
    item: MyScheduleItem | TrainerScheduleItem | null;
    isCoach: boolean;
    onClose: () => void;
    onRequestCancel?: (item: MyScheduleItem) => void | Promise<void>;
    onMarkAttended?: (item: TrainerScheduleItem) => void | Promise<void>;
    submittingCancel?: boolean;
    submittingAttendance?: boolean;
};

function getStatusLabel(status?: string | null): string | null {
    if (!status) return null;
    if (status === "BOOKED") return "Записан";
    if (status === "CANCEL_REQUESTED") return "Запрос на отмену отправлен";
    if (status === "CANCELLED_FREE") return "Отменено без списания";
    if (status === "CANCELLED_LATE") return "Отменено со списанием";
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

export function TrainingInfoModal({
    open,
    item,
    isCoach,
    onClose,
    onRequestCancel,
    onMarkAttended,
    submittingCancel = false,
    submittingAttendance = false,
}: Props) {
    if (!open || !item) {
        return null;
    }

    const time = item.startsAt?.slice(11, 16) ?? "";

    let nameLabel = "";

    if (isCoach) {
        const trainerItem = item as TrainerScheduleItem;
        nameLabel = trainerItem.studentName ?? "";
    } else {
        const athleteItem = item as MyScheduleItem;
        nameLabel = athleteItem.coachName ?? "";
    }

    const currentStatus = getStatusLabel((item as MyScheduleItem | TrainerScheduleItem).status);

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <button
                    type="button"
                    style={s.close}
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <div style={s.title}>
                    Тренировка
                </div>

                <div style={s.row}>
                    Время: {time}
                </div>

                {nameLabel ? (
                    <div style={s.row}>
                        {isCoach ? "Ученик" : "Тренер"}: {nameLabel}
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
                </div>

            </div>
        </div>
    );
}
