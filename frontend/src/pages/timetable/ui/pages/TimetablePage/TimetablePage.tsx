// frontend/src/pages/timetable/ui/pages/TimetablePage/TimetablePage.tsx

import { clubMembersPageStyles as membersStyles } from "../../../../members/ui/pages/clubMembersPage.styles"
import type { MonthDay } from "../../../model/useMonth"
import { MonthCalendar } from "../../components/MonthCalendar/MonthCalendar"
import { timetablePageStyles as s } from "../../../styles/timetablePage.styles"
import { CreateTrainingButton } from "../../components/CreateTrainingButton/CreateTrainingButton"
import type { DayMetaLabel, TrainingStatusTone } from "../../../model/trainingStatusTone"

type TimetableTab = "TRAININGS" | "SECONDARY"

type DayMeta = {
    dot: boolean
    dotTone: TrainingStatusTone
    labels: DayMetaLabel[]
}

type SecondaryItem = {
    id: string
    sessionId: string
    personName: string
    startsAt: string
    status: string
    canConfirm: boolean
}

function statusLabel(status: string, isCoach: boolean): string {
    if (status === "BOOKED") {
        return "Записан"
    }
    if (status === "CANCEL_REQUESTED") {
        return isCoach ? "Ученик запросил отмену" : "Ожидает подтверждения тренера"
    }
    if (status === "CANCELLED_FREE") {
        return "Отмена подтверждена без списания"
    }
    if (status === "CANCELLED_LATE") {
        return "Отмена подтверждена, тренировка будет списана"
    }
    if (status === "ATTENDED") {
        return "Тренировка посещена"
    }
    if (status === "NO_SHOW") {
        return "Неявка"
    }
    return status
}

type Props = {
    days: MonthDay[]
    monthLabel: string
    selected: string | null
    tab: TimetableTab
    secondaryTabLabel: string
    secondaryItems: SecondaryItem[]
    isCoach: boolean
    loading: boolean
    secondaryLoadingId: string | null
    dayMetaByIso: Record<string, DayMeta>
    onSelect: (isoDate: string) => void
    onPrev: () => void
    onNext: () => void
    onTabChange: (tab: TimetableTab) => void
    onCreated: () => void
    onNotificationAction: (sessionId: string) => void
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
                                  secondaryLoadingId,
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
                                    {item.personName}
                                </div>
                                <div style={s.secondaryText}>
                                    {new Date(item.startsAt).toLocaleString()}
                                </div>
                                <div style={s.secondaryText}>
                                    {statusLabel(item.status, isCoach)}
                                </div>
                                {isCoach && item.canConfirm ? (
                                    <div style={s.secondaryActions}>
                                        <button
                                            type="button"
                                            style={s.secondaryApprove}
                                            onClick={() => onNotificationAction(item.sessionId)}
                                            disabled={secondaryLoadingId === item.sessionId}
                                        >
                                            {secondaryLoadingId === item.sessionId ? "Подтверждаем..." : "Подтвердить уведомление"}
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
