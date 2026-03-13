CREATE TABLE info_pages (
                            code       VARCHAR(64) PRIMARY KEY,
                            title      VARCHAR(256) NOT NULL,
                            content    TEXT NOT NULL,

                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Начальные данные для страницы "О нас".
INSERT INTO info_pages (code, title, content)
VALUES (
           'about',
           'О нас',
           'Round 13 — боксерский клуб. Здесь будет общая информация о клубе.'
       );
