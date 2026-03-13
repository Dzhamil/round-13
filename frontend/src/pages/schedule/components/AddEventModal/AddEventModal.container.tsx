import { useEffect, useState } from "react";

import { createClubEvent } from "../../api/clubEvents.api";
import { combineLocalDateAndTime } from "../../../timetable/model/timetableDate";
import { EVENT_TYPE_OPTIONS } from "../../model/schedule.types";
import { AddEventModal } from "./AddEventModal";

type Props = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
};

type TimePickerTarget = "START" | "END" | null;

export function AddEventModalContainer({ open, onClose, onSaved }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("CLUB_EVENT");
    const [typeOpen, setTypeOpen] = useState(false);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
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

        setTypeOpen(false);
        setError(null);
        setTimePickerTarget(null);
    }, [open]);

    const selectedType = EVENT_TYPE_OPTIONS.find((option) => option.value === type) ?? EVENT_TYPE_OPTIONS[0];
    const timePickerOpen = timePickerTarget !== null;
    const timePickerTitle =
        timePickerTarget === "START" ? "Время начала" : timePickerTarget === "END" ? "Время окончания" : "";

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
            await createClubEvent({
                title: normalizedTitle,
                description: normalizedDescription || undefined,
                type,
                startsAt,
                endsAt,
                location: normalizedLocation || undefined,
            });

            onSaved();
            onClose();
            setTitle("");
            setDescription("");
            setType("CLUB_EVENT");
            setDate("");
            setStartTime("");
            setEndTime("");
            setLocation("");
        } catch (rawError: any) {
            setError(rawError?.response?.data?.message ?? "Не удалось сохранить событие");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AddEventModal
            open={open}
            title={title}
            description={description}
            type={type}
            typeOpen={typeOpen}
            date={date}
            startTime={startTime}
            endTime={endTime}
            location={location}
            loading={loading}
            error={error}
            timePickerOpen={timePickerOpen}
            timePickerTitle={timePickerTitle}
            timePickerHour={pickerHour}
            timePickerMinute={pickerMinute}
            selectedType={selectedType}
            options={EVENT_TYPE_OPTIONS}
            onClose={onClose}
            onSubmit={handleSubmit}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onLocationChange={setLocation}
            onStartTimeOpen={() => openTimePicker("START")}
            onEndTimeOpen={() => openTimePicker("END")}
            onTimePickerClose={() => setTimePickerTarget(null)}
            onTimePickerApply={applyTimePicker}
            onTimePickerHourChange={setPickerHour}
            onTimePickerMinuteChange={setPickerMinute}
            onTypeToggle={() => setTypeOpen((current) => !current)}
            onTypeSelect={(value) => {
                setType(value);
                setTypeOpen(false);
            }}
        />
    );
}
