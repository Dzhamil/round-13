import { useEffect, useMemo, useState } from "react";
import { extractPanelErrorMessage } from "../../shared/lib/panelApiError";
import type {
    ErrorJournalDetail,
    ErrorJournalFilters,
    ErrorJournalListItem,
    ErrorJournalStatus,
} from "../api/panelErrorJournal.api";
import {
    fetchErrorJournal,
    fetchErrorJournalDetail,
    updateErrorJournalStatus,
} from "../api/panelErrorJournal.api";

export type UsePanelErrorJournalResult = {
    filters: ErrorJournalFilters;
    draftFilters: ErrorJournalFilters;
    items: ErrorJournalListItem[];
    selected: ErrorJournalDetail | null;
    selectedId: string | null;
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    isDetailLoading: boolean;
    isSavingStatus: boolean;
    error: string | null;
    detailError: string | null;
    setDraftFilters: (filters: ErrorJournalFilters) => void;
    applyFilters: () => void;
    resetFilters: () => void;
    setPage: (page: number) => void;
    selectItem: (id: string) => Promise<void>;
    closeDetail: () => void;
    saveStatus: (status: ErrorJournalStatus, note: string) => Promise<void>;
    reload: () => Promise<void>;
};

const DEFAULT_FILTERS: ErrorJournalFilters = {
    status: "OPEN",
    severity: "ALL",
    source: "ALL",
    httpStatus: "",
    from: "",
    to: "",
    path: "",
    errorCode: "",
    q: "",
};

const PAGE_SIZE = 25;

export function usePanelErrorJournal(): UsePanelErrorJournalResult {
    const [filters, setFilters] = useState<ErrorJournalFilters>(DEFAULT_FILTERS);
    const [draftFilters, setDraftFilters] = useState<ErrorJournalFilters>(DEFAULT_FILTERS);
    const [items, setItems] = useState<ErrorJournalListItem[]>([]);
    const [selected, setSelected] = useState<ErrorJournalDetail | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [page, setPageState] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);

    const size = PAGE_SIZE;

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page]);

    async function reload(): Promise<void> {
        setError(null);
        setIsLoading(true);
        try {
            const result = await fetchErrorJournal(filters, page, size);
            setItems(result.items);
            setTotalItems(result.totalItems);
            setTotalPages(result.totalPages);
        } catch (e: unknown) {
            setItems([]);
            setTotalItems(0);
            setTotalPages(0);
            setError(extractPanelErrorMessage(e, "Не удалось загрузить журнал ошибок"));
        } finally {
            setIsLoading(false);
        }
    }

    async function selectItem(id: string): Promise<void> {
        setSelectedId(id);
        setSelected(null);
        setDetailError(null);
        setIsDetailLoading(true);
        try {
            setSelected(await fetchErrorJournalDetail(id));
        } catch (e: unknown) {
            setDetailError(extractPanelErrorMessage(e, "Не удалось загрузить запись журнала"));
        } finally {
            setIsDetailLoading(false);
        }
    }

    async function saveStatus(status: ErrorJournalStatus, note: string): Promise<void> {
        if (!selectedId) {
            return;
        }

        setDetailError(null);
        setIsSavingStatus(true);
        try {
            const updated = await updateErrorJournalStatus(selectedId, status, note);
            setSelected(updated);
            await reload();
        } catch (e: unknown) {
            setDetailError(extractPanelErrorMessage(e, "Не удалось сохранить статус"));
        } finally {
            setIsSavingStatus(false);
        }
    }

    function applyFilters(): void {
        setPageState(0);
        setFilters(draftFilters);
    }

    function resetFilters(): void {
        setPageState(0);
        setDraftFilters(DEFAULT_FILTERS);
        setFilters(DEFAULT_FILTERS);
    }

    function setPage(nextPage: number): void {
        setPageState(Math.max(0, nextPage));
    }

    function closeDetail(): void {
        setSelectedId(null);
        setSelected(null);
        setDetailError(null);
    }

    return useMemo(() => ({
        filters,
        draftFilters,
        items,
        selected,
        selectedId,
        page,
        size,
        totalItems,
        totalPages,
        isLoading,
        isDetailLoading,
        isSavingStatus,
        error,
        detailError,
        setDraftFilters,
        applyFilters,
        resetFilters,
        setPage,
        selectItem,
        closeDetail,
        saveStatus,
        reload,
    }), [
        filters,
        draftFilters,
        items,
        selected,
        selectedId,
        page,
        size,
        totalItems,
        totalPages,
        isLoading,
        isDetailLoading,
        isSavingStatus,
        error,
        detailError,
    ]);
}
