export type MembersGroup =
    | "FIGHTERS"
    | "COACHES"

export type MemberListItem = {

    id: string

    nickname: string

    phone: string | null

    avatarUrl: string | null

    points: number

    statusLabel: string

    roleCode: string | null

    remainingTrainings: number | null

}

export type MemberDetails = {

    id: string

    nickname: string

    phone: string | null

    avatarUrl: string | null

    roleCode: string | null

    points: number

    statusLabel: string

    tenureMonths: number

    fightsCount: number
    winsCount: number
    defeatsCount: number

    knockoutsCount: number
    knockdownsCount: number

    trainingsAttendedCount: number | null
    trainingsConductedCount: number | null
    studentsCount: number | null

    aboutMe: string | null

    myStudent: boolean

    remainingTrainings: number | null

    trainerStudentCard: TrainerStudentCard | null
}

export type MembersListResponse = {

    items: MemberListItem[]

}

export type TrainingBalanceHistoryItem = {

    id: string

    studentId: string

    studentName: string

    delta: number

    balanceAfter: number

    eventType: string | null

    createdByUserId: string | null

    createdByName: string | null

    createdAt: string

}

export type TrainingBalanceHistoryResponse = {

    items: TrainingBalanceHistoryItem[]

}

export type StudentOperationalStatusCode =
    | "ACTIVE"
    | "RISK"
    | "LONG_ABSENT"

export type StudentOperationalStatus = {
    code: StudentOperationalStatusCode
    lastAttendedAt: string | null
}

export type TrainerStudentNote = {
    note: string | null
    updatedAt: string | null
    updatedByUserId: string | null
    updatedByName: string | null
}

export type StudentTrainingActivity = {
    id: string
    title: string
    startTime: string
    durationMinutes: number
    location: string | null
    participantStatus: string | null
}

export type TrainerStudentCard = {
    operationalStatus: StudentOperationalStatus | null
    trainerNote: TrainerStudentNote | null
    nextTraining: StudentTrainingActivity | null
    recentTrainings: StudentTrainingActivity[]
    recentBalanceChanges: TrainingBalanceHistoryItem[]
}

export type TrainerStudentHistory = {
    trainings: StudentTrainingActivity[]
    balanceChanges: TrainingBalanceHistoryItem[]
}
