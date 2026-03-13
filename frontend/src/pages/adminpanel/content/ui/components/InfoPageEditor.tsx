import { Button } from "../../../../../shared/ui/Button";
import type { EditableInfoPage, EditableInfoPageCode } from "../../model/panelContent.types";
import { adminContentPageStyles as styles } from "../styles/AdminContentPage.styles";

type InfoPageEditorProps = {
    code: EditableInfoPageCode;
    page: EditableInfoPage;
    description: string;
    hint: string;
    isSaving: boolean;
    onChange: (code: EditableInfoPageCode, field: "title" | "content", value: string) => void;
    onSave: (code: EditableInfoPageCode) => void;
};

function formatUpdatedAt(value: string | null): string {
    if (!value) {
        return "Еще не публиковалась";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Дата недоступна";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function InfoPageEditor(props: InfoPageEditorProps) {
    const { code, page, description, hint, isSaving, onChange, onSave } = props;
    const fallbackTitle = code === "about" ? "О клубе" : code === "contacts" ? "Контакты" : "Новичкам";

    return (
        <section style={styles.card}>
            <div>
                <h2 style={styles.sectionTitle}>{page.title || fallbackTitle}</h2>
                <p style={styles.sectionText}>{description}</p>
            </div>

            <div style={styles.meta}>Последнее обновление: {formatUpdatedAt(page.updatedAt)}</div>

            <div style={styles.form}>
                <label style={styles.label}>
                    Заголовок
                    <input
                        style={styles.input}
                        value={page.title}
                        onChange={(event) => onChange(code, "title", event.target.value)}
                    />
                </label>

                <label style={styles.label}>
                    Контент
                    <textarea
                        style={styles.textarea}
                        value={page.content}
                        onChange={(event) => onChange(code, "content", event.target.value)}
                    />
                </label>
            </div>

            <div style={styles.note}>{hint}</div>

            <div style={styles.actions}>
                <Button onClick={() => onSave(code)} disabled={isSaving}>
                    {isSaving ? "Сохраняем..." : "Сохранить страницу"}
                </Button>
            </div>
        </section>
    );
}
