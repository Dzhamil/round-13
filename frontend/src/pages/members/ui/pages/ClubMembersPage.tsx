// frontend/src/pages/members/ui/pages/ClubMembersPage.tsx
import { clubMembersPageStyles as s } from "./clubMembersPage.styles";
import { MemberHistoryCard } from "../components/MemberHistoryCard";
import { type MembersTab, useClubMembersPage } from "../../model/useClubMembersPage";
import { useIsCoach } from "../../model/useIsCoach";
import { MiniUserCard } from "../components/MiniUserCard/MiniUserCard";
import { MemberDetailsModal } from "../components/MemberDetailsModal/MemberDetailsModal.container";

const BASE_TABS: Array<{ value: MembersTab; label: string }> = [
    { value: "FIGHTERS", label: "Бойцы" },
    { value: "COACHES", label: "Тренеры" },
];

const COACH_TABS: Array<{ value: MembersTab; label: string }> = [
    { value: "MY_STUDENTS", label: "Мои ученики" },
    { value: "HISTORY", label: "История" },
];

export function ClubMembersPage() {
    const isCoach = useIsCoach();
    const { tab, setTab, items, historyItems, loading, error, selected, setSelected, reload } = useClubMembersPage();

    function handleStudentChanged() {
        if (tab === "MY_STUDENTS") {
            void reload("MY_STUDENTS");
        }
    }

    const tabs = isCoach ? [...BASE_TABS, ...COACH_TABS] : BASE_TABS;

    return (
        <div style={s.root}>
            <div style={s.membersTabsWrap(tabs.length)} role="group" aria-label="Разделы участников">
                {tabs.map((tabItem) => {
                    const active = tab === tabItem.value;

                    return (
                        <button
                            key={tabItem.value}
                            type="button"
                            aria-pressed={active}
                            style={s.membersTab(active, tabs.length)}
                            onClick={() => setTab(tabItem.value)}
                        >
                            {tabItem.label}
                        </button>
                    );
                })}
            </div>

            <div
                id="members-tab-panel"
                style={s.content}
            >
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
