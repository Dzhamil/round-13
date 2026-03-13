// frontend/src/pages/timetable/ui/pages/TimetablePage/TimetablePage.tsx

import { clubMembersPageStyles as membersStyles } from "../../../../members/ui/pages/clubMembersPage.styles"
import type { MonthDay } from "../../../model/useMonth"
import { MonthCalendar } from "../../components/MonthCalendar/MonthCalendar"
import { timetablePageStyles as s } from "../../../styles/timetablePage.styles"
import { CreateTrainingButton } from "../../components/CreateTrainingButton/CreateTrainingButton"
import type { TrainingCancelRequest } from "../../../model/trainingCancelRequests"

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
    secondaryItems: TrainingCancelRequest[]
    isCoach: boolean
    loading: boolean
    dayMetaByIso: Record<string, DayMeta>
    onSelect: (isoDate: string) => void
    onPrev: () => void
    onNext: () => void
    onTabChange: (tab: TimetableTab) => void
    onCreated: () => void
    onNotificationAction: (requestId: string, action: "ACCEPTED" | "DECLINED") => void
}

export function TimetablePage({
                                  days,
                                  monthLabel,
                                  selected,
                                  tab,
                                  secondaryTabLabel,
                                  secondaryItems,
                                  isCoach,
                                  loading,
                                  dayMetaByIso,
                                  onSelect,
                                  onPrev,
                                  onNext,
                                  onTabChange,
                                  onCreated,
                                  onNotificationAction,
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
                        onCreated={onCreated}
                    />

                </>

            ) : (
                secondaryItems.length === 0 ? (
                    <div style={s.placeholder}>
                        {isCoach ? "Нет уведомлений" : "Нет запросов"}
                    </div>
                ) : (
                    <div style={s.secondaryList}>
                        {secondaryItems.map((item) => (
                            <div key={item.id} style={s.secondaryCard}>
                                <div style={s.secondaryTitle}>
                                    {isCoach ? item.studentName : item.coachName}
                                </div>
                                <div style={s.secondaryText}>
                                    {new Date(item.startsAt).toLocaleString()}
                                </div>
                                <div style={s.secondaryText}>
                                    {item.status === "PENDING"
                                        ? isCoach
                                            ? "Запрос на отмену тренировки"
                                            : "Ожидает ответа тренера"
                                        : item.status === "ACCEPTED"
                                            ? "Запрос принят"
                                            : "Запрос отклонён"}
                                </div>
                                {isCoach && item.status === "PENDING" ? (
                                    <div style={s.secondaryActions}>
                                        <button
                                            type="button"
                                            style={s.secondaryApprove}
                                            onClick={() => onNotificationAction(item.id, "ACCEPTED")}
                                        >
                                            Принять
                                        </button>
                                        <button
                                            type="button"
                                            style={s.secondaryDecline}
                                            onClick={() => onNotificationAction(item.id, "DECLINED")}
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )

            )}

        </div>
    )
}
