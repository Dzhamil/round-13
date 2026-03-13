// frontend/src/pages/about/AboutPage.tsx
import { useState } from "react";
import { aboutPageStyles as s } from "./styles/aboutPage.styles";

/**
 * Страница "О нас".
 * Пока текст локальный.
 * Если пользователь админ — доступно редактирование.
 */

export function AboutPage() {
    // TODO: заменить на реальные данные пользователя из auth/store
    const isAdmin = true;

    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(
        "Добро пожаловать в клуб 13 раунд.\n\nЗдесь будет описание группы."
    );

    function save() {
        // TODO: подключить backend сохранение
        setEditing(false);
    }

    return (
        <div style={s.root}>
            <div style={s.card}>
                {!editing ? (
                    <>
                        <div style={s.text}>
                            {text.split("\n").map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>

                        {isAdmin && (
                            <button style={s.editButton} onClick={() => setEditing(true)}>
                                Редактировать
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <textarea
                            style={s.textarea}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <div style={s.actions}>
                            <button style={s.saveButton} onClick={save}>
                                Сохранить
                            </button>
                            <button
                                style={s.cancelButton}
                                onClick={() => setEditing(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AboutPage;
