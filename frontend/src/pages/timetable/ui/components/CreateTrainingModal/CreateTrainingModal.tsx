// frontend/src/pages/timetable/ui/components/CreateTrainingModal/CreateTrainingModal.tsx
import { useEffect, useMemo, useState } from "react"
import { createPersonalTraining, fetchTrainerSchedule } from "../../../api/trainerSchedule.api"
import { getMyStudents } from "../../../../members/api/members.api"
import type { MemberListItem } from "../../../../members/model/members.types"
import { createTrainingModalStyles as s } from "./createTrainingModal.styles"
import { addDays, combineLocalDateAndTime, parseIsoDateLocal, startOfDayIso, toLocalIsoDate } from "../../../model/timetableDate"
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types"

type ApiError = {
    response?: {
        data?: {
            message?: string
        }
    }
}

type Props = {
    open: boolean
    date: string
    onClose: () => void
    onCreated?: () => void
}

const TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
    const totalMinutes = 6 * 60 + index * 30
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
})

export function CreateTrainingModal({ open, date, onClose, onCreated }: Props) {

    const [students, setStudents] = useState<MemberListItem[]>([])
    const [coachSchedule, setCoachSchedule] = useState<TrainerScheduleItem[]>([])
    const [studentQuery, setStudentQuery] = useState("")
    const [selectedDate, setSelectedDate] = useState(date)
    const [studentId, setStudentId] = useState<string | null>(null)
    const [time, setTime] = useState("10:00")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false)
    const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)

    function getDefaultTime(dateIso: string): string {
        const selected = parseIsoDateLocal(dateIso)
        const now = new Date()

        if (toLocalIsoDate(selected) !== toLocalIsoDate(now)) {
            return "10:00"
        }

        const nextHour = new Date(now)
        nextHour.setMinutes(0, 0, 0)
        nextHour.setHours(nextHour.getHours() + 1)

        if (nextHour.getDate() !== now.getDate()) {
            return "23:00"
        }

        return `${String(nextHour.getHours()).padStart(2, "0")}:00`
    }

    useEffect(() => {

        if (!open) {
            return
        }

        getMyStudents()
            .then(res => setStudents(res.items))
            .catch(() => setStudents([]))

    }, [open])

    useEffect(() => {
        if (!open) {
            return
        }

        setStudentQuery("")
        setSelectedDate(date)
        setStudentId(null)
        setTime(getDefaultTime(date))
        setError(null)
        setStudentDropdownOpen(false)
        setTimeDropdownOpen(false)
    }, [date, open])

    useEffect(() => {
        if (!open) {
            return
        }

        let active = true

        fetchTrainerSchedule({
            from: startOfDayIso(selectedDate),
            to: startOfDayIso(addDays(selectedDate, 1))
        })
            .then((items) => {
                if (!active) {
                    return
                }
                setCoachSchedule(items)
            })
            .catch(() => {
                if (!active) {
                    return
                }
                setCoachSchedule([])
            })

        return () => {
            active = false
        }
    }, [open, selectedDate])

    const filteredStudents = useMemo(() => {
        const query = studentQuery.trim().toLowerCase()

        if (!query) {
            return students
        }

        return students.filter((student) =>
            student.nickname.toLowerCase().includes(query)
        )
    }, [studentQuery, students])

    const selectedStudent = useMemo(() => {
        return students.find((student) => student.id === studentId) ?? null
    }, [studentId, students])

    const availableTimeOptions = useMemo(() => {
        const now = new Date()

        return TIME_OPTIONS.filter((option) => {
            const slotStart = new Date(combineLocalDateAndTime(selectedDate, option))
            if (Number.isNaN(slotStart.getTime()) || slotStart.getTime() <= now.getTime()) {
                return false
            }

            const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

            return !coachSchedule.some((item) => {
                const itemStart = new Date(item.startsAt)
                const itemEnd = item.endsAt
                    ? new Date(item.endsAt)
                    : new Date(itemStart.getTime() + 60 * 60 * 1000)

                return itemStart < slotEnd && itemEnd > slotStart
            })
        })
    }, [coachSchedule, selectedDate])

    useEffect(() => {
        if (!open) {
            return
        }

        if (availableTimeOptions.includes(time)) {
            return
        }

        setTime(availableTimeOptions[0] ?? "")
    }, [availableTimeOptions, open, time])

    async function handleCreate() {

        if (!studentId || !time || submitting) {
            return
        }

        const startTime = combineLocalDateAndTime(selectedDate, time)
        const selectedDateTime = new Date(startTime)
        const now = new Date()

        if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime.getTime() <= now.getTime()) {
            setError("Выбери дату и время в будущем")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            await createPersonalTraining({
                studentId,
                startTime,
                durationMinutes: 60
            })

            onCreated?.()
            onClose()
        } catch (rawError) {
            const apiError = rawError as ApiError
            setError(apiError.response?.data?.message ?? "Не удалось создать тренировку")
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) {
        return null
    }

    return (
        <div data-swipe-back-exclude style={s.overlay}>

            <div style={s.modal} role="dialog" aria-modal="true">

                <div style={s.title}>
                    Новая тренировка
                </div>

                <div style={s.date}>
                    День из календаря уже подставлен, но его можно поменять
                </div>

                <div style={s.fieldWrap}>
                    <label style={s.fieldLabel} htmlFor="training-student">
                        Ученик
                    </label>
                    <div style={s.comboWrap}>
                    <input
                        id="training-student"
                        style={s.fieldInput}
                        type="text"
                        value={studentQuery}
                        placeholder={selectedStudent?.nickname ?? "Начни вводить имя ученика"}
                        onFocus={() => setStudentDropdownOpen(true)}
                        onChange={(e) => {
                            setStudentQuery(e.target.value)
                            setStudentId(null)
                            setStudentDropdownOpen(true)
                        }}
                        onBlur={() => {
                            window.setTimeout(() => setStudentDropdownOpen(false), 120)
                        }}
                    />
                    <div style={s.dropdown}>
                        {studentDropdownOpen ? (
                            filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        style={{
                                            ...s.dropdownItem,
                                            ...(studentId === student.id ? s.dropdownItemActive : {})
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            setStudentId(student.id)
                                            setStudentQuery(student.nickname)
                                            setStudentDropdownOpen(false)
                                        }}
                                    >
                                        {student.nickname}
                                    </button>
                                ))
                            ) : (
                                <div style={s.dropdownEmpty}>
                                    Ничего не найдено
                                </div>
                            )
                        ) : null}
                    </div>
                    </div>
                </div>

                <div style={s.fieldWrap}>
                    <label style={s.fieldLabel} htmlFor="training-date">
                        Дата
                    </label>
                    <input
                        id="training-date"
                        style={s.fieldInput}
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setTimeDropdownOpen(false)
                        }}
                    />
                </div>

                <div style={s.fieldWrap}>
                    <label style={s.fieldLabel} htmlFor="training-time">
                        Время
                    </label>
                    <div style={s.comboWrap}>
                        <input
                            id="training-time"
                            style={s.fieldInput}
                            type="text"
                            value={time}
                            readOnly
                            placeholder="Выбери время"
                            onFocus={() => setTimeDropdownOpen(true)}
                            onClick={() => setTimeDropdownOpen((value) => !value)}
                            onBlur={() => {
                                window.setTimeout(() => setTimeDropdownOpen(false), 120)
                            }}
                        />
                        <div style={s.dropdown}>
                            {timeDropdownOpen ? (
                                availableTimeOptions.length > 0 ? (
                                    availableTimeOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            style={{
                                                ...s.dropdownItem,
                                                ...(time === option ? s.dropdownItemActive : {})
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                setTime(option)
                                                setTimeDropdownOpen(false)
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))
                                ) : (
                                    <div style={s.dropdownEmpty}>
                                        Нет свободного времени
                                    </div>
                                )
                            ) : null}
                        </div>
                    </div>
                </div>

                {error ? (
                    <div style={s.error}>
                        {error}
                    </div>
                ) : null}

                <div style={s.actions}>

                    <button
                        type="button"
                        style={s.cancel}
                        onClick={onClose}
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        style={s.create}
                        onClick={handleCreate}
                        disabled={!studentId || !time || submitting}
                    >
                        {submitting ? "Создание..." : "Создать"}
                    </button>

                </div>

            </div>

        </div>
    )
}
