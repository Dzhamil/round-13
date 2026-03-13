import { useEffect, useState, type FormEvent } from "react";
import styles from "../AboutPage.module.css";
import { getDefaultInfoPageTitle, getInfoPageEditorHint } from "../aboutPage.helpers";
import type { AboutEditablePageCode, InfoPageResponse, UpsertInfoPagePayload } from "../model/about.types";

type AboutEditorCardProps = {
    pageCode: AboutEditablePageCode;
    page: InfoPageResponse | null;
    isSaving: boolean;
    error: string | null;
    onCancel: () => void;
    onSave: (payload: UpsertInfoPagePayload) => Promise<void>;
};

export function AboutEditorCard(props: AboutEditorCardProps) {
    const { pageCode, page, isSaving, error, onCancel, onSave } = props;
    const [title, setTitle] = useState(page?.title ?? getDefaultInfoPageTitle(pageCode));
    const [content, setContent] = useState(page?.content ?? "");

    useEffect(() => {
        setTitle(page?.title ?? getDefaultInfoPageTitle(pageCode));
        setContent(page?.content ?? "");
    }, [page, pageCode]);

    const editorHint = getInfoPageEditorHint(pageCode);
    const isSubmitDisabled = !title.trim() || !content.trim() || isSaving;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await onSave({
            title: title.trim(),
            content: content.trim(),
        });
    }

    return (
        <form className={styles.editorCard} onSubmit={handleSubmit}>
            <div className={styles.editorField}>
                <label className={styles.editorLabel} htmlFor={`about-editor-title-${pageCode}`}>
                    Заголовок
                </label>
                <input
                    id={`about-editor-title-${pageCode}`}
                    className={styles.editorInput}
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={256}
                    placeholder="Введите заголовок"
                />
            </div>

            <div className={styles.editorField}>
                <label className={styles.editorLabel} htmlFor={`about-editor-content-${pageCode}`}>
                    Содержимое
                </label>
                <textarea
                    id={`about-editor-content-${pageCode}`}
                    className={styles.editorTextarea}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Введите текст страницы"
                    rows={pageCode === "contacts" ? 10 : 12}
                />
                {editorHint && <p className={styles.editorHint}>{editorHint}</p>}
                {error && <p className={styles.editorError}>{error}</p>}
            </div>

            <div className={styles.editorActions}>
                <button type="button" className={styles.secondaryButton} onClick={onCancel}>
                    Отмена
                </button>
                <button type="submit" className={styles.primaryButton} disabled={isSubmitDisabled}>
                    {isSaving ? "Сохраняем..." : "Сохранить"}
                </button>
            </div>
        </form>
    );
}
