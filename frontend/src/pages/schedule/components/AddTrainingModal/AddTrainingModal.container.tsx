import { useEffect, useState } from "react";

import { createCoachTrainingEvent, updateCoachTrainingEvent } from "../../api/clubEvents.api";
import { getMembers } from "../../../members/api/members.api";
import type { MemberListItem } from "../../../members/model/members.types";
import { combineLocalDateAndTime, toLocalIsoDate } from "../../../timetable/model/timetableDate";
import type { ClubEventItem } from "../../model/schedule.types";
import { AddTrainingModal } from "./AddTrainingModal";

type Props = {
    open: boolean;
    initialItem?: ClubEventItem | null;
    onClose: () => void;
    onSaved: () => void;
};

type TimePickerTarget = "START" | "END" | null;

export function AddTrainingModalContainer({ open, initialItem, onClose, onSaved }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [trainerId, setTrainerId] = useState("");
    const [trainers, setTrainers] = useState<MemberListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);
    const [pickerHour, setPickerHour] = useState("10");
    const [pickerMinute, setPickerMinute] = useState("00");

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const startDate = initialItem?.startsAt ? new Date(initialItem.startsAt) : null;
        const endDate = initialItem?.endsAt ? new Date(initialItem.endsAt) : null;

        setTitle(initialItem?.title ?? "");
        setDescription(initialItem?.description ?? "");
        setDate(startDate && !Number.isNaN(startDate.getTime()) ? toLocalIsoDate(startDate) : "");
        setStartTime(
            startDate && !Number.isNaN(startDate.getTime())
                ? `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`
                : ""
        );
        setEndTime(
            endDate && !Number.isNaN(endDate.getTime())
                ? `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
                : ""
        );
        setLocation(initialItem?.location ?? "");
        setTrainerId(initialItem?.trainerUserId ?? "");
        setError(null);
        setTimePickerTarget(null);
    }, [initialItem, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        let active = true;
        getMembers("COACHES")
            .then((response) => {
                if (active) {
                    setTrainers(response.items);
                }
            })
            .catch(() => {
                if (active) {
                    setTrainers([]);
                }
            });

        return () => {
            active = false;
        };
    }, [open]);

    const timePickerOpen = timePickerTarget !== null;
    const timePickerTitle =
        timePickerTarget === "START" ? "Время начала" : timePickerTarget === "END" ? "Время окончания" : "";
    const isEditMode = Boolean(initialItem);

    function parseTime(value: string): { hour: string; minute: string } {
        const [rawHour = "10", rawMinute = "00"] = value.split(":");
        const minuteValue = Number(rawMinute);
        const snappedMinute = Math.max(0, Math.min(55, Math.round(minuteValue / 5) * 5));

        return {
            hour: String(Number(rawHour)).padStart(2, "0"),
            minute: String(snappedMinute).padStart(2, "0"),
        };
    }

    function openTimePicker(target: TimePickerTarget) {
        const currentValue = target === "START" ? startTime : endTime;
        const parsed = parseTime(currentValue || "10:00");
        setPickerHour(parsed.hour);
        setPickerMinute(parsed.minute);
        setTimePickerTarget(target);
    }

    function applyTimePicker() {
        const nextValue = `${pickerHour}:${pickerMinute}`;

        if (timePickerTarget === "START") {
            setStartTime(nextValue);
        }

        if (timePickerTarget === "END") {
            setEndTime(nextValue);
        }

        setTimePickerTarget(null);
    }

    async function handleSubmit() {
        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();
        const normalizedLocation = location.trim();

        if (!normalizedTitle || !date || !startTime || !endTime) {
            setError("Заполни название, дату и время");
            return;
        }

        const startsAt = combineLocalDateAndTime(date, startTime);
        const endsAt = combineLocalDateAndTime(date, endTime);

        if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
            setError("Время окончания должно быть позже времени начала");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: normalizedTitle,
                description: normalizedDescription || undefined,
                startsAt,
                endsAt,
                location: normalizedLocation || undefined,
                trainerId: trainerId || undefined,
            };

            if (initialItem) {
                await updateCoachTrainingEvent(initialItem.id, payload);
            } else {
                await createCoachTrainingEvent(payload);
            }

            onSaved();
            onClose();
            setTitle("");
            setDescription("");
            setDate("");
            setStartTime("");
            setEndTime("");
            setLocation("");
            setTrainerId("");
        } catch (rawError: any) {
            setError(rawError?.response?.data?.message ?? "Не удалось сохранить тренировку");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AddTrainingModal
            open={open}
            title={title}
            description={description}
            date={date}
            startTime={startTime}
            endTime={endTime}
            location={location}
            trainerId={trainerId}
            trainers={trainers}
            mode={isEditMode ? "EDIT" : "CREATE"}
            loading={loading}
            error={error}
            timePickerOpen={timePickerOpen}
            timePickerTitle={timePickerTitle}
            timePickerHour={pickerHour}
            timePickerMinute={pickerMinute}
            onClose={onClose}
            onSubmit={handleSubmit}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onLocationChange={setLocation}
            onTrainerIdChange={setTrainerId}
            onStartTimeOpen={() => openTimePicker("START")}
            onEndTimeOpen={() => openTimePicker("END")}
            onTimePickerClose={() => setTimePickerTarget(null)}
            onTimePickerApply={applyTimePicker}
            onTimePickerHourChange={setPickerHour}
            onTimePickerMinuteChange={setPickerMinute}
        />
    );
}
