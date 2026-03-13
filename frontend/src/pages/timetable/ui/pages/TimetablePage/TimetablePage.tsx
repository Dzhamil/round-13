// frontend/src/pages/timetable/ui/pages/TimetablePage/TimetablePage.tsx

import { clubMembersPageStyles as membersStyles } from "../../../../members/ui/pages/clubMembersPage.styles"
import type { MonthDay } from "../../../model/useMonth"
import { MonthCalendar } from "../../components/MonthCalendar/MonthCalendar"
import { timetablePageStyles as s } from "../../../styles/timetablePage.styles"
import { CreateTrainingButton } from "../../components/CreateTrainingButton/CreateTrainingButton"

type TimetableTab = "TRAININGS" | "SECONDARY"

type DayMeta = {
    dot: boolean
    labels: string[]
}

type Props = {
    days: MonthDay[]
    monthLabel: string
    selected: string | null
    tab: TimetableTab
    secondaryTabLabel: string
    isCoach: boolean
    loading: boolean
    nickname: string | null
    dayMetaByIso: Record<string, DayMeta>
    onSelect: (isoDate: string) => void
    onPrev: () => void
    onNext: () => void
    onTabChange: (tab: TimetableTab) => void
}

export function TimetablePage({
                                  days,
                                  monthLabel,
                                  selected,
                                  tab,
                                  secondaryTabLabel,
                                  isCoach,
                                  loading,
                                  dayMetaByIso,
                                  onSelect,
                                  onPrev,
                                  onNext,
                                  onTabChange,
                              }: Props) {

    return (
        <div style={s.root}>

            <div style={membersStyles.tabsWrap}>

                <button
                    type="button"
                    style={membersStyles.tab(tab === "TRAININGS")}
                    onClick={() => onTabChange("TRAININGS")}
                >
                    Тренировки
                </button>

                <button
                    type="button"
                    style={membersStyles.tab(tab === "SECONDARY")}
                    onClick={() => onTabChange("SECONDARY")}
                >
                    {secondaryTabLabel}
                </button>

            </div>

            {tab === "TRAININGS" ? (

                <>

                    <div style={s.header}>

                        <button
                            type="button"
                            style={s.navButton}
                            onClick={onPrev}
                        >
                            ‹
                        </button>

                        <span style={s.title}>
                            {monthLabel}
                        </span>

                        <button
                            type="button"
                            style={s.navButton}
                            onClick={onNext}
                        >
                            ›
                        </button>

                    </div>

                    {loading ? (

                        <div style={s.placeholder}>
                            Загрузка…
                        </div>

                    ) : (

                        <MonthCalendar
                            days={days}
                            selected={selected}
                            dayMetaByIso={dayMetaByIso}
                            onSelect={onSelect}
                        />

                    )}

                    <CreateTrainingButton
                        date={selected}
                    />

                </>

            ) : (

                <div style={s.placeholder}>
                    {isCoach ? "Нет уведомлений" : "Нет запросов"}
                </div>

            )}

        </div>
    )
}