import { useCallback, useEffect, useState } from "react";
import { getAdminTrainerStudentLinks, getMembers, getMyStudents, getTrainingBalanceHistory } from "../api/members.api";
import type { MemberListItem, MembersGroup, TrainingBalanceHistoryItem } from "./members.types";

export type MembersTab = MembersGroup | "MY_STUDENTS" | "HISTORY";

type State = {
    tab: MembersTab
    items: MemberListItem[]
    historyItems: TrainingBalanceHistoryItem[]
    loading: boolean
    error: string | null
    selected: MemberListItem | null
    setTab: (tab: MembersTab) => void
    setSelected: (member: MemberListItem | null) => void
    reload: (tab?: MembersTab) => Promise<void>
}

type Params = {
    useAdminStudentLinks?: boolean
}

export function useClubMembersPage({ useAdminStudentLinks = false }: Params = {}): State {
    const [tab, setTab] = useState<MembersTab>("FIGHTERS");
    const [items, setItems] = useState<MemberListItem[]>([]);
    const [historyItems, setHistoryItems] = useState<TrainingBalanceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<MemberListItem | null>(null);

    const reload = useCallback(async (nextTab: MembersTab = tab) => {
        setLoading(true);
        setError(null);

        try {
            if (nextTab === "MY_STUDENTS") {
                const response = useAdminStudentLinks
                    ? await getAdminTrainerStudentLinks()
                    : await getMyStudents();
                setItems(response.items);
                setHistoryItems([]);
                return;
            }

            if (nextTab === "HISTORY") {
                const response = await getTrainingBalanceHistory();
                setHistoryItems(response.items);
                setItems([]);
                return;
            }

            const response = await getMembers(nextTab);
            setItems(response.items);
            setHistoryItems([]);
        } catch (nextError) {
            console.error(nextError);
            setItems([]);
            setHistoryItems([]);
            setError("Не удалось загрузить список. Попробуйте еще раз.");
        } finally {
            setLoading(false);
        }
    }, [tab, useAdminStudentLinks]);

    useEffect(() => {
        void reload(tab);
    }, [reload, tab]);

    return {
        tab,
        items,
        historyItems,
        loading,
        error,
        selected,
        setTab,
        setSelected,
        reload,
    };
}
