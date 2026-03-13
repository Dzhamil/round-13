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
}

export type MembersListResponse = {

    items: MemberListItem[]

}