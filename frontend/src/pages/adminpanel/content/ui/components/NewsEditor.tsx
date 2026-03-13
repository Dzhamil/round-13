import { Button } from "../../../../../shared/ui/Button";
import type { AdminNewsPost, EditableNewsForm } from "../../model/panelContent.types";
import { adminContentPageStyles as styles } from "../styles/AdminContentPage.styles";

type NewsEditorProps = {
    news: AdminNewsPost[];
    form: EditableNewsForm;
    isSaving: boolean;
    isDeleting: boolean;
    onSelect: (item: AdminNewsPost) => void;
    onCreate: () => void;
    onChange: (field: keyof EditableNewsForm, value: string | boolean) => void;
    onSave: () => void;
    onDelete: () => void;
};

function formatNewsMeta(item: AdminNewsPost): string {
    if (!item.published || !item.publishedAt) {
        return "Черновик";
    }

    const date = new Date(item.publishedAt);
    if (Number.isNaN(date.getTime())) {
        return "Опубликована";
    }

    return `Опубликована ${new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date)}`;
}

export function NewsEditor(props: NewsEditorProps) {
    const {
        news,
        form,
        isSaving,
        isDeleting,
        onSelect,
        onCreate,
        onChange,
        onSave,
        onDelete,
    } = props;

    return (
        <section style={styles.card}>
            <div>
                <h2 style={styles.sectionTitle}>Новости клуба</h2>
                <p style={styles.sectionText}>
                    Публикации из этого блока попадают на главную страницу. Храните в анонсе короткий
                    текст карточки, а в полном поле оставляйте расширенную версию для дальнейшего
                    развития раздела.
                </p>
            </div>

            <div style={styles.actions}>
                <Button onClick={onCreate} variant="secondary">
                    Новая новость
                </Button>
            </div>

            <div style={styles.newsGrid}>
                <div style={styles.newsList}>
                    {!news.length && (
                        <div style={styles.state}>
                            Пока нет ни одной новости. Создайте первую запись и опубликуйте ее.
                        </div>
                    )}

                    {news.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            style={{
                                ...styles.newsItem,
                                ...(form.id === item.id ? styles.newsItemActive : {}),
                            }}
                            onClick={() => onSelect(item)}
                        >
                            <span style={styles.newsItemTitle}>{item.title}</span>
                            <span style={styles.newsItemMeta}>{formatNewsMeta(item)}</span>
                        </button>
                    ))}
                </div>

                <div style={styles.form}>
                    <label style={styles.label}>
                        Заголовок
                        <input
                            style={styles.input}
                            value={form.title}
                            onChange={(event) => onChange("title", event.target.value)}
                        />
                    </label>

                    <label style={styles.label}>
                        Короткий анонс
                        <textarea
                            style={{ ...styles.textarea, minHeight: 120 }}
                            value={form.excerpt}
                            onChange={(event) => onChange("excerpt", event.target.value)}
                        />
                    </label>

                    <label style={styles.label}>
                        Полный текст
                        <textarea
                            style={{ ...styles.textarea, minHeight: 220 }}
                            value={form.content}
                            onChange={(event) => onChange("content", event.target.value)}
                        />
                    </label>

                    <label style={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(event) => onChange("published", event.target.checked)}
                        />
                        Показать новость на главной
                    </label>
                </div>
            </div>

            <div style={styles.actions}>
                <Button onClick={onSave} disabled={isSaving}>
                    {isSaving ? "Сохраняем..." : form.id ? "Сохранить новость" : "Создать новость"}
                </Button>

                <Button
                    onClick={onDelete}
                    disabled={!form.id || isDeleting}
                    variant="secondary"
                >
                    {isDeleting ? "Удаляем..." : "Удалить новость"}
                </Button>
            </div>
        </section>
    );
}
