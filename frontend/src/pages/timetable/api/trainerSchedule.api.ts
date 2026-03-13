// frontend/src/pages/timetable/api/trainerSchedule.api.ts

import { http } from "../../../shared/api/http"
import type { TrainerScheduleItem } from "../model/trainerSchedule.types"

export async function fetchTrainerSchedule(params?: {
    from?: string
    to?: string
}): Promise<TrainerScheduleItem[]> {

    const res = await http.get<TrainerScheduleItem[]>(
        "/trainer/schedule",
        {
            params: {
                ...(params?.from ? { from: params.from } : {}),
                ...(params?.to ? { to: params.to } : {})
            }
        }
    )

    return res.data ?? []
}

export async function createPersonalTraining(data: {
    studentId: string
    startTime: string
    durationMinutes: number
}): Promise<string> {

    const res = await http.post<string>(
        "/trainer/personal-trainings",
        data
    )

    return res.data
}