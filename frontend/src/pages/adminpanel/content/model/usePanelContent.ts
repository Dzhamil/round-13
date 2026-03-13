import { useEffect, useState } from "react";
import { getAdminNews, getEditableInfoPage } from "../api/panelContent.api";
import { createEmptyNewsForm, createInitialPages, toNewsForm } from "./panelContent.helpers";
import { usePanelInfoPages } from "./usePanelInfoPages";
import { usePanelNews } from "./usePanelNews";

export function usePanelContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const infoPages = usePanelInfoPages();
    const newsState = usePanelNews();

    async function load(): Promise<void> {
        setIsLoading(true);
        setLoadError(null);

        const defaults = createInitialPages();
        const [aboutResult, contactsResult, newcomersResult, newsResult] = await Promise.allSettled([
            getEditableInfoPage("about"),
            getEditableInfoPage("contacts"),
            getEditableInfoPage("newcomers"),
            getAdminNews(),
        ]);

        infoPages.setPages({
            about: aboutResult.status === "fulfilled" ? aboutResult.value : defaults.about,
            contacts: contactsResult.status === "fulfilled" ? contactsResult.value : defaults.contacts,
            newcomers: newcomersResult.status === "fulfilled" ? newcomersResult.value : defaults.newcomers,
        });

        const nextNews = newsResult.status === "fulfilled" ? newsResult.value : [];
        newsState.setNews(nextNews);
        newsState.setNewsForm(nextNews.length ? toNewsForm(nextNews[0]) : createEmptyNewsForm());

        if (
            aboutResult.status === "rejected"
            || contactsResult.status === "rejected"
            || newcomersResult.status === "rejected"
            || newsResult.status === "rejected"
        ) {
            setLoadError("Не все данные контент-раздела удалось загрузить. Можно продолжить редактирование и обновить экран позже.");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        void load();
    }, []);

    return {
        isLoading,
        loadError,
        load,
        ...infoPages,
        ...newsState,
    };
}
