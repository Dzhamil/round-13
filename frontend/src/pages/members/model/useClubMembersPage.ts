import { useCallback, useEffect, useRef, useState } from "react";
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
    const [tab, setActiveTab] = useState<MembersTab>("FIGHTERS");
    const [items, setItems] = useState<MemberListItem[]>([]);
    const [historyItems, setHistoryItems] = useState<TrainingBalanceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<MemberListItem | null>(null);

    const requestVersion = useRef(0);

    function setTab(nextTab: MembersTab) {
        if (nextTab === tab) return;
        requestVersion.current += 1;
        setLoading(true);
        setError(null);
        setActiveTab(nextTab);
    }

    const reload = useCallback(async (nextTab: MembersTab = tab) => {
        const version = ++requestVersion.current;
        setLoading(true);
        setError(null);

        try {
            if (nextTab === "MY_STUDENTS") {
                const response = useAdminStudentLinks
                    ? await getAdminTrainerStudentLinks()
                    : await getMyStudents();
                if (version !== requestVersion.current) return;
                setItems(response.items);
                setHistoryItems([]);
                return;
            }

            if (nextTab === "HISTORY") {
                const response = await getTrainingBalanceHistory();
                if (version !== requestVersion.current) return;
                setHistoryItems(response.items);
                setItems([]);
                return;
            }

            // The server selects COACHES by explicit trainer identity, including ADMIN + trainer.
            const response = await getMembers(nextTab);
            if (version !== requestVersion.current) return;
            setItems(response.items);
            setHistoryItems([]);
        } catch (nextError) {
            if (version !== requestVersion.current) return;
            console.error(nextError);
            setItems([]);
            setHistoryItems([]);
            setError("Не удалось загрузить список. Попробуйте еще раз.");
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [tab, useAdminStudentLinks]);

    useEffect(() => {
        void reload(tab);
        return () => { requestVersion.current += 1; };
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
