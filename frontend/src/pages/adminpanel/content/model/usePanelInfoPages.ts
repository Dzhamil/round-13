import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getEditableInfoPage, saveEditableInfoPage } from "../api/panelContent.api";
import { createInitialPages } from "./panelContent.helpers";
import type { EditableInfoPage, EditableInfoPageCode } from "./panelContent.types";

type UsePanelInfoPagesResult = {
    pages: Record<EditableInfoPageCode, EditableInfoPage>;
    pageSavingCode: EditableInfoPageCode | null;
    pageError: string | null;
    pageSuccess: string | null;
    setPages: Dispatch<SetStateAction<Record<EditableInfoPageCode, EditableInfoPage>>>;
    updatePageField: (code: EditableInfoPageCode, field: "title" | "content", value: string) => void;
    savePage: (code: EditableInfoPageCode) => Promise<void>;
};

export function usePanelInfoPages(): UsePanelInfoPagesResult {
    const [pages, setPages] = useState<Record<EditableInfoPageCode, EditableInfoPage>>(createInitialPages);
    const [pageSavingCode, setPageSavingCode] = useState<EditableInfoPageCode | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [pageSuccess, setPageSuccess] = useState<string | null>(null);

    function updatePageField(code: EditableInfoPageCode, field: "title" | "content", value: string): void {
        setPages((current) => ({
            ...current,
            [code]: {
                ...current[code],
                [field]: value,
            },
        }));
    }

    async function savePage(code: EditableInfoPageCode): Promise<void> {
        const page = pages[code];
        setPageSavingCode(code);
        setPageError(null);
        setPageSuccess(null);

        try {
            await saveEditableInfoPage(code, {
                title: page.title,
                content: page.content,
            });

            const refreshed = await getEditableInfoPage(code);
            setPages((current) => ({
                ...current,
                [code]: refreshed,
            }));
            setPageSuccess(`Страница «${refreshed.title}» сохранена.`);
        } catch {
            setPageError("Не удалось сохранить информационную страницу.");
        } finally {
            setPageSavingCode(null);
        }
    }

    return {
        pages,
        pageSavingCode,
        pageError,
        pageSuccess,
        setPages,
        updatePageField,
        savePage,
    };
}
