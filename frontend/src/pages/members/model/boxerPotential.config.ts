import type {
    BoxerPotentialCharacteristicKey,
    BoxerPotentialMeasurement,
    BoxerPotentialRawValues,
    BoxerPotentialTestKey,
} from "./boxerPotential.types";

export type BoxerPotentialTestConfig = {
    key: BoxerPotentialTestKey
    scoreKey: keyof BoxerPotentialMeasurement["testScores"]
    characteristic: BoxerPotentialCharacteristicKey
    label: string
    shortLabel: string
    unit: string
    normLabel: string
    description: string
};

export type BoxerPotentialCharacteristicConfig = {
    key: BoxerPotentialCharacteristicKey
    label: string
    description: string
    tests: BoxerPotentialTestKey[]
};

export const BOXER_POTENTIAL_TESTS: BoxerPotentialTestConfig[] = [
    {
        key: "pushUps90Sec",
        scoreKey: "pushUpsScore",
        characteristic: "strength",
        label: "Отжимания за 1.5 минуты",
        shortLabel: "Отжимания",
        unit: "повт.",
        normLabel: "100 отжиманий = 100 points",
        description: "Фактическое количество отжиманий за 1.5 минуты.",
    },
    {
        key: "pullUps",
        scoreKey: "pullUpsScore",
        characteristic: "strength",
        label: "Подтягивания",
        shortLabel: "Подтягивания",
        unit: "повт.",
        normLabel: "40 подтягиваний = 100 points",
        description: "Фактическое количество подтягиваний.",
    },
    {
        key: "jumpSquats90Sec",
        scoreKey: "jumpSquatsScore",
        characteristic: "strength",
        label: "Взрывные прыжки за 1.5 минуты",
        shortLabel: "Прыжки",
        unit: "повт.",
        normLabel: "80 прыжков = 100 points",
        description: "Фактическое количество jump squats за 1.5 минуты.",
    },
    {
        key: "punchForceKg",
        scoreKey: "punchForceScore",
        characteristic: "strength",
        label: "Динамометр / сила одного удара",
        shortLabel: "Сила удара",
        unit: "кг",
        normLabel: "400 кг для male, 150 кг для female/children = 100 points",
        description: "Фактическая сила одного удара по динамометру.",
    },
    {
        key: "burpees5Min",
        scoreKey: "burpeesScore",
        characteristic: "endurance",
        label: "Берпи за 5 минут",
        shortLabel: "Берпи",
        unit: "повт.",
        normLabel: "100 берпи = 100 points",
        description: "Фактическое количество burpees за 5 минут.",
    },
    {
        key: "punches20Sec",
        scoreKey: "punchesScore",
        characteristic: "speed",
        label: "Удары за 20 секунд",
        shortLabel: "Удары",
        unit: "уд.",
        normLabel: "80 ударов = 100 points",
        description: "Комбинация 5 punches, slip, duck. Считаются только punches.",
    },
    {
        key: "ropeJumps60Sec",
        scoreKey: "ropeJumpsScore",
        characteristic: "agility",
        label: "Single rope jumps за 1 минуту",
        shortLabel: "Скакалка",
        unit: "прыж.",
        normLabel: "220 прыжков = 100 points",
        description: "Фактическое количество одинарных прыжков за 1 минуту.",
    },
    {
        key: "doubleUnders60Sec",
        scoreKey: "doubleUndersScore",
        characteristic: "agility",
        label: "Double-under rope jumps за 1 минуту",
        shortLabel: "Double-under",
        unit: "прыж.",
        normLabel: "110 прыжков = 100 points",
        description: "Фактическое количество двойных прыжков за 1 минуту.",
    },
];

export const BOXER_POTENTIAL_CHARACTERISTICS: BoxerPotentialCharacteristicConfig[] = [
    {
        key: "strength",
        label: "Сила",
        description: "Средний score четырех силовых тестов.",
        tests: ["pushUps90Sec", "pullUps", "jumpSquats90Sec", "punchForceKg"],
    },
    {
        key: "endurance",
        label: "Выносливость",
        description: "Score теста burpees за 5 минут.",
        tests: ["burpees5Min"],
    },
    {
        key: "speed",
        label: "Скорость",
        description: "Score ударной комбинации за 20 секунд.",
        tests: ["punches20Sec"],
    },
    {
        key: "agility",
        label: "Ловкость",
        description: "Средний score двух тестов со скакалкой.",
        tests: ["ropeJumps60Sec", "doubleUnders60Sec"],
    },
];

export const EMPTY_RAW_VALUES: BoxerPotentialRawValues = {
    pushUps90Sec: 0,
    pullUps: 0,
    jumpSquats90Sec: 0,
    punchForceKg: 0,
    burpees5Min: 0,
    punches20Sec: 0,
    ropeJumps60Sec: 0,
    doubleUnders60Sec: 0,
};

export function getCharacteristicConfig(key: BoxerPotentialCharacteristicKey) {
    return BOXER_POTENTIAL_CHARACTERISTICS.find((item) => item.key === key);
}

export function getTestConfig(key: BoxerPotentialTestKey) {
    return BOXER_POTENTIAL_TESTS.find((item) => item.key === key);
}
