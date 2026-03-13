// frontend/src/pages/members/ui/pages/ClubMembersPage.tsx
import { clubMembersPageStyles as s } from "./clubMembersPage.styles";
import { MemberHistoryCard } from "../components/MemberHistoryCard";
import { useClubMembersPage } from "../../model/useClubMembersPage";
import { useIsCoach } from "../../model/useIsCoach";
import { MiniUserCard } from "../components/MiniUserCard/MiniUserCard";
import { MemberDetailsModal } from "../components/MemberDetailsModal/MemberDetailsModal.container";

export function ClubMembersPage() {
    const isCoach = useIsCoach();
    const { tab, setTab, items, historyItems, loading, error, selected, setSelected, reload } = useClubMembersPage();

    function handleStudentChanged() {
        if (tab === "MY_STUDENTS") {
            void reload("MY_STUDENTS");
        }
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
                {!loading && error && <div style={s.placeholder}>{error}</div>}
                {!loading && !error && tab !== "HISTORY" && items.map((member) => (
                    <MiniUserCard
                        key={member.id}
                        member={member}
                        onClick={setSelected}
                    />
                ))}
                {!loading && !error && tab !== "HISTORY" && items.length === 0 && (
                    <div style={s.placeholder}>Список пока пуст.</div>
                )}
                {!loading && !error && tab === "HISTORY" && historyItems.length === 0 && (
                    <div style={s.placeholder}>Пока нет изменений баланса тренировок</div>
                )}
                {!loading && !error && tab === "HISTORY" && historyItems.map((item) => (
                    <MemberHistoryCard key={item.id} item={item} />
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
