// frontend/src/pages/members/ui/pages/ClubMembersPage.tsx
import { useEffect, useState } from "react";
import { clubMembersPageStyles as s } from "./clubMembersPage.styles";
import { getMembers, getMyStudents } from "../../api/members.api";
import type { MemberListItem, MembersGroup } from "../../model/members.types";
import { useIsCoach } from "../../model/useIsCoach";
import { MiniUserCard } from "../components/MiniUserCard/MiniUserCard";
import { MemberDetailsModal } from "../components/MemberDetailsModal/MemberDetailsModal";

type MembersTab = MembersGroup | "MY_STUDENTS";

export function ClubMembersPage() {
    const isCoach = useIsCoach();
    const [tab, setTab] = useState<MembersTab>("FIGHTERS");
    const [items, setItems] = useState<MemberListItem[]>([]);
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
            } else {
                const res = await getMembers(currentTab);
                setItems(res.items);
            }
        } catch (e) {
            console.error(e);
            setItems([]);
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
            </div>

            <div style={s.content}>
                {loading && <div style={s.placeholder}>Загрузка…</div>}
                {!loading && items.map((member) => (
                    <MiniUserCard
                        key={member.id}
                        member={member}
                        onClick={setSelected}
                    />
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
