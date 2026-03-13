// frontend/src/pages/timetable/ui/components/CreateTrainingModal/CreateTrainingModal.tsx
import { useEffect, useMemo, useState } from "react"
import { createPersonalTraining } from "../../../api/trainerSchedule.api"
import { getMyStudents } from "../../../../members/api/members.api"
import type { MemberListItem } from "../../../../members/model/members.types"
import { createTrainingModalStyles as s } from "./createTrainingModal.styles"

type Props = {
    open: boolean
    date: string
    onClose: () => void
}

export function CreateTrainingModal({ open, date, onClose }: Props) {

    const [students, setStudents] = useState<MemberListItem[]>([])
    const [search, setSearch] = useState("")
    const [studentId, setStudentId] = useState<string | null>(null)
    const [time, setTime] = useState("10:00")

    useEffect(() => {

        if (!open) {
            return
        }

        // Получаем список моих учеников. API возвращает объект с полем `items`,
        // поэтому здесь берём именно `items`, чтобы получить массив учеников.
        getMyStudents()
            .then(res => setStudents(res.items))
            .catch(() => setStudents([]))

    }, [open])

    const filtered = useMemo(() => {

        const q = search.trim().toLowerCase()

        if (!q) {
            return students
        }

        return students.filter(
            s => s.nickname.toLowerCase().includes(q)
        )

    }, [students, search])

    async function handleCreate() {

        if (!studentId) {
            return
        }

        const startTime = `${date}T${time}:00`

        await createPersonalTraining({
            studentId,
            startTime,
            durationMinutes: 60
        })

        onClose()
    }

    if (!open) {
        return null
    }

    return (
        <div style={s.overlay}>

            <div style={s.modal}>

                <div style={s.title}>
                    Новая тренировка
                </div>

                <input
                    style={s.search}
                    placeholder="Поиск ученика"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div style={s.list}>

                    {filtered.map(student => (

                        <button
                            key={student.id}
                            style={{
                                ...s.student,
                                ...(studentId === student.id ? s.studentActive : {})
                            }}
                            onClick={() => setStudentId(student.id)}
                        >
                            {student.nickname}
                        </button>

                    ))}

                </div>

                <input
                    style={s.time}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <div style={s.actions}>

                    <button
                        style={s.cancel}
                        onClick={onClose}
                    >
                        Отмена
                    </button>

                    <button
                        style={s.create}
                        onClick={handleCreate}
                    >
                        Создать
                    </button>

                </div>

            </div>

        </div>
    )
}