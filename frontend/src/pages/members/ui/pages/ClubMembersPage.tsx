// frontend/src/pages/members/ui/pages/ClubMembersPage.tsx
import { useEffect, useState } from "react";
import { clubMembersPageStyles as s } from "./clubMembersPage.styles";
import { getMembers, getMyStudents, getTrainingBalanceHistory } from "../../api/members.api";
import type { MemberListItem, MembersGroup, TrainingBalanceHistoryItem } from "../../model/members.types";
import { useIsCoach } from "../../model/useIsCoach";
import { MiniUserCard } from "../components/MiniUserCard/MiniUserCard";
import { MemberDetailsModal } from "../components/MemberDetailsModal/MemberDetailsModal";

type MembersTab = MembersGroup | "MY_STUDENTS" | "HISTORY";

function formatDateTime(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function buildHistoryTitle(item: TrainingBalanceHistoryItem): string {
    return item.delta > 0 ? "Добавлена тренировка" : "Списана тренировка";
}

export function ClubMembersPage() {
    const isCoach = useIsCoach();
    const [tab, setTab] = useState<MembersTab>("FIGHTERS");
    const [items, setItems] = useState<MemberListItem[]>([]);
    const [historyItems, setHistoryItems] = useState<TrainingBalanceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<MemberListItem | null>(null);

    useEffect(() => {
        load(tab);
    }, [tab]);

    async function load(currentTab: MembersTab) {
        setLoading(true);
        try {
            if (currentTab === "MY_STUDENTS") {
                const res = await getMyStudents();
                setItems(res.items);
                setHistoryItems([]);
            } else if (currentTab === "HISTORY") {
                const res = await getTrainingBalanceHistory();
                setHistoryItems(res.items);
                setItems([]);
            } else {
                const res = await getMembers(currentTab);
                setItems(res.items);
                setHistoryItems([]);
            }
        } catch (e) {
            console.error(e);
            setItems([]);
            setHistoryItems([]);
        } finally {
            setLoading(false);
        }
    }

    function handleStudentChanged() {
        if (tab === "MY_STUDENTS") load("MY_STUDENTS");
    }

    return (
        <div style={s.root}>
            <div style={s.tabsWrap}>
                <button style={s.tab(tab === "FIGHTERS")} onClick={() => setTab("FIGHTERS")}>
                    Бойцы
                </button>
                <button style={s.tab(tab === "COACHES")} onClick={() => setTab("COACHES")}>
                    Тренеры
                </button>
                {isCoach && (
                    <button style={s.tab(tab === "MY_STUDENTS")} onClick={() => setTab("MY_STUDENTS")}>
                        Мои ученики
                    </button>
                )}
                {isCoach && (
                    <button style={s.tab(tab === "HISTORY")} onClick={() => setTab("HISTORY")}>
                        История
                    </button>
                )}
            </div>

            <div style={s.content}>
                {loading && <div style={s.placeholder}>Загрузка…</div>}
                {!loading && tab !== "HISTORY" && items.map((member) => (
                    <MiniUserCard
                        key={member.id}
                        member={member}
                        onClick={setSelected}
                    />
                ))}
                {!loading && tab === "HISTORY" && historyItems.length === 0 && (
                    <div style={s.placeholder}>Пока нет изменений баланса тренировок</div>
                )}
                {!loading && tab === "HISTORY" && historyItems.map((item) => (
                    <div key={item.id} style={s.historyCard}>
                        <div style={s.historyTop}>
                            <div>
                                <div style={s.historyTitle}>{buildHistoryTitle(item)}</div>
                                <div style={s.historyMeta}>{item.studentName}</div>
                            </div>
                            <div style={s.historyDelta(item.delta > 0)}>
                                {item.delta > 0 ? `+${item.delta}` : item.delta}
                            </div>
                        </div>
                        <div style={s.historyMeta}>
                            Остаток после изменения: {item.balanceAfter}
                        </div>
                        <div style={s.historyMeta}>
                            Действие выполнил: {item.createdByName ?? "Сотрудник"}
                        </div>
                        <div style={s.historyTime}>{formatDateTime(item.createdAt)}</div>
                    </div>
                ))}
            </div>

            <MemberDetailsModal
                open={Boolean(selected)}
                member={selected}
                onClose={() => setSelected(null)}
                onStudentChanged={handleStudentChanged}
            />
        </div>
    );
}
