import type { MemberListItem } from "../../../../members/model/members.types";
import { Button } from "../../../../shared/ui/Button";
import { ScheduleTimePicker } from "../ScheduleTimePicker";
import { formatTrainerOptionLabel } from "./addTrainingModal.helpers";
import { addTrainingModalStyles as s } from "./addTrainingModal.styles";

type Props = {
    open: boolean;
    mode: "CREATE" | "EDIT";
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    trainerId: string;
    trainers: MemberListItem[];
    loading: boolean;
    error: string | null;
    timePickerOpen: boolean;
    timePickerTitle: string;
    timePickerHour: string;
    timePickerMinute: string;
    onClose: () => void;
    onSubmit: () => void;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onTrainerIdChange: (value: string) => void;
    onStartTimeOpen: () => void;
    onEndTimeOpen: () => void;
    onTimePickerClose: () => void;
    onTimePickerApply: (hour: string, minute: string) => void;
    onTimePickerCommit: (hour: string, minute: string) => void;
    onTimePickerHourChange: (value: string) => void;
    onTimePickerMinuteChange: (value: string) => void;
};

export function AddTrainingModal({
    open,
    mode,
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    trainerId,
    trainers,
    loading,
    error,
    timePickerOpen,
    timePickerTitle,
    timePickerHour,
    timePickerMinute,
    onClose,
    onSubmit,
    onTitleChange,
    onDescriptionChange,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
    onLocationChange,
    onTrainerIdChange,
    onStartTimeOpen,
    onEndTimeOpen,
    onTimePickerClose,
    onTimePickerApply,
    onTimePickerCommit,
    onTimePickerHourChange,
    onTimePickerMinuteChange,
}: Props) {
    if (!open) {
        return null;
    }

    return (
        <div
            style={s.modalOverlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div style={s.modalCard}>
                <div style={s.modalHeader}>
                    <h3 style={s.modalTitle}>{mode === "EDIT" ? "Редактировать тренировку" : "Добавить тренировку"}</h3>
                    <p style={s.modalHint}>Заполни основные данные тренировки для афиши.</p>
                </div>

                <div style={s.formGrid}>
                    <label style={s.field}>
                        <span style={s.fieldLabel}>Название</span>
                        <input
                            style={s.input}
                            value={title}
                            onChange={(event) => onTitleChange(event.target.value)}
                            placeholder="Например, Персональная тренировка"
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Описание</span>
                        <textarea
                            style={s.textarea}
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                            placeholder="Коротко: формат, цель, детали"
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Дата</span>
                        <input
                            style={s.input}
                            type="date"
                            value={date}
                            onChange={(event) => onDateChange(event.target.value)}
                        />
                    </label>

                    <div style={s.timeRow}>
                        <label style={s.field}>
                            <span style={s.fieldLabel}>Время начала</span>
                            <button type="button" style={s.timeButton} onClick={onStartTimeOpen}>
                                {startTime || "Выбрать"}
                            </button>
                        </label>

                        <label style={s.field}>
                            <span style={s.fieldLabel}>Время окончания</span>
                            <button type="button" style={s.timeButton} onClick={onEndTimeOpen}>
                                {endTime || "Выбрать"}
                            </button>
                        </label>
                    </div>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Место</span>
                        <input
                            style={s.input}
                            value={location}
                            onChange={(event) => onLocationChange(event.target.value)}
                            placeholder="Например, зал Round 13"
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Тренер</span>
                        <select
                            style={s.input}
                            value={trainerId}
                            onChange={(event) => onTrainerIdChange(event.target.value)}
                        >
                            <option value="">Не выбран</option>
                            {trainers.map((trainer) => (
                                <option key={trainer.id} value={trainer.id}>
                                    {formatTrainerOptionLabel(trainer)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {error ? <p style={s.error}>{error}</p> : null}

                <div style={s.modalActions}>
                    <Button onClick={onClose} variant="secondary" disabled={loading}>
                        Закрыть
                    </Button>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "Сохранение..." : mode === "EDIT" ? "Сохранить изменения" : "Сохранить"}
                    </Button>
                </div>
            </div>

            <ScheduleTimePicker
                open={timePickerOpen}
                title={timePickerTitle}
                hour={timePickerHour}
                minute={timePickerMinute}
                onHourChange={onTimePickerHourChange}
                onMinuteChange={onTimePickerMinuteChange}
                onClose={onTimePickerClose}
                onApply={onTimePickerApply}
                onCommitTime={onTimePickerCommit}
            />
        </div>
    );
}
