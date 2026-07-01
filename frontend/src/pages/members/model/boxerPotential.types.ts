export type BoxerPotentialNormGroup = "MALE_16_PLUS" | "FEMALE" | "CHILD";

export type BoxerPotentialRawValues = {
    pushUps90Sec: number
    pullUps: number
    jumpSquats90Sec: number
    punchForceKg: number
    burpees5Min: number
    punches20Sec: number
    ropeJumps60Sec: number
    doubleUnders60Sec: number
}

export type BoxerPotentialMeasurementRequest = BoxerPotentialRawValues & {
    measuredAt: string
}

export type BoxerPotentialTestScores = {
    pushUpsScore: number
    pullUpsScore: number
    jumpSquatsScore: number
    punchForceScore: number
    burpeesScore: number
    punchesScore: number
    ropeJumpsScore: number
    doubleUndersScore: number
}

export type BoxerPotentialCharacteristicScores = {
    strength: number
    endurance: number
    speed: number
    agility: number
}

export type BoxerPotentialMeasurement = {
    id: string
    memberId: string
    measuredAt: string
    createdAt: string
    createdByUserId: string
    createdByName: string | null
    normGroup: BoxerPotentialNormGroup
    normGroupLabel: string
    normSet: "MALE" | "FEMALE_CHILD"
    ageAtMeasurement: number
    genderAtMeasurement: string
    raw: BoxerPotentialRawValues
    testScores: BoxerPotentialTestScores
    characteristicScores: BoxerPotentialCharacteristicScores
    potentialScore: number
}

export type BoxerPotentialChartPoint = {
    measuredAt: string
    potentialScore: number
    strengthScore: number
    enduranceScore: number
    speedScore: number
    agilityScore: number
}

export type BoxerPotentialSummary = {
    latest: BoxerPotentialMeasurement | null
    history: BoxerPotentialMeasurement[]
    chart: BoxerPotentialChartPoint[]
    canCreateMeasurement: boolean
    createBlockedReason: string | null
}

export type BoxerPotentialLeaderboardItem = {
    place: number
    memberId: string
    nickname: string
    avatarUrl: string | null
    measuredAt: string
    potentialScore: number
    strengthScore: number
    enduranceScore: number
    speedScore: number
    agilityScore: number
}

export type BoxerPotentialLeaderboard = {
    normGroup: BoxerPotentialNormGroup
    normGroupLabel: string
    items: BoxerPotentialLeaderboardItem[]
}
