import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    createAdminNews,
    deleteAdminNews,
    getAdminNews,
    updateAdminNews,
} from "../api/panelContent.api";
import { createEmptyNewsForm, toNewsForm } from "./panelContent.helpers";
import type { AdminNewsPost, EditableNewsForm } from "./panelContent.types";

type UsePanelNewsResult = {
    news: AdminNewsPost[];
    newsForm: EditableNewsForm;
    newsError: string | null;
    newsSuccess: string | null;
    isNewsSaving: boolean;
    isNewsDeleting: boolean;
    setNews: Dispatch<SetStateAction<AdminNewsPost[]>>;
    setNewsForm: Dispatch<SetStateAction<EditableNewsForm>>;
    selectNews: (item: AdminNewsPost) => void;
    startCreateNews: () => void;
    updateNewsField: (field: keyof EditableNewsForm, value: string | boolean) => void;
    saveNews: () => Promise<void>;
    removeNews: () => Promise<void>;
};

export function usePanelNews(): UsePanelNewsResult {
    const [news, setNews] = useState<AdminNewsPost[]>([]);
    const [newsForm, setNewsForm] = useState<EditableNewsForm>(createEmptyNewsForm);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [newsSuccess, setNewsSuccess] = useState<string | null>(null);
    const [isNewsSaving, setIsNewsSaving] = useState(false);
    const [isNewsDeleting, setIsNewsDeleting] = useState(false);

    function selectNews(item: AdminNewsPost): void {
        setNewsForm(toNewsForm(item));
        setNewsError(null);
        setNewsSuccess(null);
    }

    function startCreateNews(): void {
        setNewsForm(createEmptyNewsForm());
        setNewsError(null);
        setNewsSuccess(null);
    }

    function updateNewsField(field: keyof EditableNewsForm, value: string | boolean): void {
        setNewsForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function reloadNews(selectId?: string | null): Promise<void> {
        const items = await getAdminNews();
        setNews(items);

        if (!items.length) {
            setNewsForm(createEmptyNewsForm());
            return;
        }

        const active = selectId ? items.find((item) => item.id === selectId) : null;
        setNewsForm(toNewsForm(active ?? items[0]));
    }

    async function saveNews(): Promise<void> {
        setIsNewsSaving(true);
        setNewsError(null);
        setNewsSuccess(null);

        try {
            let targetId = newsForm.id;

            if (newsForm.id) {
                await updateAdminNews(newsForm.id, newsForm);
            } else {
                targetId = await createAdminNews(newsForm);
            }

            await reloadNews(targetId);
            setNewsSuccess(targetId === newsForm.id ? "Новость обновлена." : "Новость создана.");
        } catch {
            setNewsError("Не удалось сохранить новость.");
        } finally {
            setIsNewsSaving(false);
        }
    }

    async function removeNews(): Promise<void> {
        if (!newsForm.id) {
            return;
        }

        setIsNewsDeleting(true);
        setNewsError(null);
        setNewsSuccess(null);

        try {
            await deleteAdminNews(newsForm.id);
            await reloadNews(null);
            setNewsSuccess("Новость удалена.");
        } catch {
            setNewsError("Не удалось удалить новость.");
        } finally {
            setIsNewsDeleting(false);
        }
    }

    return {
        news,
        newsForm,
        newsError,
        newsSuccess,
        isNewsSaving,
        isNewsDeleting,
        setNews,
        setNewsForm,
        selectNews,
        startCreateNews,
        updateNewsField,
        saveNews,
        removeNews,
    };
}
