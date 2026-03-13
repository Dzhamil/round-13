import { useEffect, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useOutletContext,
} from "react-router-dom";
import { aboutApi } from "./api/about.api";
import type { InfoPageResponse } from "./model/about.types";
import styles from "./AboutPage.module.css";
import { getRules, type RuleResponse } from "../../shared/api/rules.api";
import { groupRulesToSections, type Rule } from "../rules/rules.utils";

type AboutTabId = "overview" | "rules" | "contacts" | "newcomers";

type AboutTab = {
    id: AboutTabId;
    label: string;
    hint: string;
    to: string;
    end?: boolean;
};

type InfoCard = {
    title: string;
    text: string;
};

type ContactCard = {
    title: string;
    value: string;
    hint: string;
    isPlaceholder?: boolean;
};

type ChecklistSection = {
    title: string;
    items: string[];
};

const ABOUT_TABS: AboutTab[] = [
    { id: "overview", label: "О клубе", hint: "Общий обзор и формат клуба", to: "/about", end: true },
    { id: "rules", label: "Правила клуба", hint: "Ключевые договоренности и дисциплина", to: "/about/rules" },
    { id: "contacts", label: "Контакты", hint: "Как связаться и что лучше указать", to: "/about/contacts" },
    { id: "newcomers", label: "Новичкам", hint: "Что взять и как подготовиться", to: "/about/newcomers" },
];

type AboutOutletContext = {
    page: InfoPageResponse;
    rules: Rule[];
    isRulesLoading: boolean;
    rulesError: string | null;
};

const CLUB_HIGHLIGHTS: InfoCard[] = [
    {
        title: "Тренировки",
        text: "Основной ритм клуба уже живет в приложении: расписание, статусы и дневной вид тренировок.",
    },
    {
        title: "Афиша",
        text: "События, сборы и внутренние активности логично держать рядом с общей информацией о клубе.",
    },
    {
        title: "Сообщество",
        text: "Раздел участников помогает быстрее влиться в клуб и понимать, кто тренируется рядом.",
    },
];

const CONTACT_CARDS: ContactCard[] = [
    {
        title: "Telegram",
        value: "Укажите @username клуба",
        hint: "Основной канал для записи, быстрых вопросов и объявлений.",
        isPlaceholder: true,
    },
    {
        title: "Телефон",
        value: "Добавьте номер администратора",
        hint: "Полезно для тех, кому удобнее звонок, а не переписка.",
        isPlaceholder: true,
    },
    {
        title: "Адрес зала",
        value: "Добавьте адрес, вход и ориентир",
        hint: "Лучше сразу указать этаж, вход со двора или ориентир по парковке.",
        isPlaceholder: true,
    },
    {
        title: "Время связи",
        value: "Добавьте часы ответа",
        hint: "Например: ежедневно с 10:00 до 22:00.",
        isPlaceholder: true,
    },
];

const NEWCOMER_SECTIONS: ChecklistSection[] = [
    {
        title: "Перед первым визитом",
        items: [
            "Запишитесь на тренировку заранее, чтобы тренер понимал состав группы.",
            "Приходите за 10–15 минут до начала, чтобы спокойно переодеться и освоиться.",
            "Если есть травмы или ограничения, предупредите тренера до разминки.",
        ],
    },
    {
        title: "Что взять с собой",
        items: [
            "Спортивную форму и сменную обувь, если это требуется залом.",
            "Бинты, капу, воду и небольшое полотенце.",
            "Если своей экипировки пока нет, заранее уточните, что можно взять в клубе.",
        ],
    },
    {
        title: "Как быстрее адаптироваться",
        items: [
            "Смотрите раздел «Тренировки», чтобы не выпадать из ритма недели.",
            "Изучите правила клуба до первой спарринговой или групповой тренировки.",
            "После занятия задайте тренеру один конкретный вопрос по технике или плану прогресса.",
        ],
    },
];

function toRule(rule: RuleResponse): Rule {
    return {
        code: rule.code,
        title: rule.title,
        content: rule.content,
        sortOrder: rule.sortOrder,
    };
}

function splitTextToParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/g)
        .map((part) => part.trim())
        .filter(Boolean);
}

function formatUpdatedAt(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function resolveActiveTab(pathname: string): AboutTab {
    return ABOUT_TABS.find((tab) => {
        if (tab.end) {
            return pathname === tab.to || pathname === `${tab.to}/`;
        }

        return pathname.startsWith(tab.to);
    }) ?? ABOUT_TABS[0];
}

function useAboutContext() {
    return useOutletContext<AboutOutletContext>();
}

function OverviewTab({ page }: { page: InfoPageResponse }) {
    const paragraphs = splitTextToParagraphs(page.content);

    return (
        <div className={styles.sectionStack}>
            <p className={styles.sectionLead}>
                Главная справка о клубе в одном месте: кто мы, как устроен ритм клуба и где искать
                остальные важные разделы.
            </p>

            <div className={styles.contentGrid}>
                <div className={styles.richText}>
                    {paragraphs.length ? (
                        paragraphs.map((paragraph, index) => (
                            <p key={`${page.code}-paragraph-${index}`} className={styles.paragraph}>
                                {paragraph}
                            </p>
                        ))
                    ) : (
                        <p className={styles.paragraph}>
                            Добавьте краткое описание клуба, его атмосферы и ключевых принципов.
                        </p>
                    )}
                </div>

                <div className={styles.sideGrid}>
                    {CLUB_HIGHLIGHTS.map((card) => (
                        <article key={card.title} className={styles.infoCard}>
                            <h3 className={styles.infoCardTitle}>{card.title}</h3>
                            <p className={styles.infoCardText}>{card.text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RulesTab({
    rules,
    loading,
    error,
}: {
    rules: Rule[];
    loading: boolean;
    error: string | null;
}) {
    if (loading) {
        return <div className={styles.stateInline}>Загружаем правила клуба…</div>;
    }

    if (error) {
        return <div className={styles.stateInline}>{error}</div>;
    }

    if (!rules.length) {
        return <div className={styles.stateInline}>Правила пока не добавлены.</div>;
    }

    const sections = groupRulesToSections(rules);

    return (
        <div className={styles.sectionStack}>
            <p className={styles.sectionLead}>
                Вкладка собрана прямо внутри страницы клуба, чтобы ключевые правила были рядом с
                общей информацией и не терялись в навигации.
            </p>

            {sections.map((section) => (
                <section key={section.key} className={styles.ruleSection}>
                    <h3 className={styles.ruleSectionTitle}>{section.title}</h3>
                    <div className={styles.cardGrid}>
                        {section.rules.map((rule) => (
                            <article key={rule.code} className={styles.infoCard}>
                                <h4 className={styles.infoCardTitle}>{rule.title}</h4>
                                <p className={styles.infoCardText}>{rule.content}</p>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function ContactsTab() {
    return (
        <div className={styles.sectionStack}>
            <p className={styles.sectionLead}>
                Каркас для контактной информации уже готов. Сейчас здесь безопасные плейсхолдеры,
                чтобы можно было быстро подставить реальные данные клуба без новой верстки.
            </p>

            <div className={styles.noteCard}>
                Лучше всего держать здесь один главный канал связи, резервный номер и точный адрес
                зала с ориентиром.
            </div>

            <div className={styles.cardGrid}>
                {CONTACT_CARDS.map((card) => (
                    <article key={card.title} className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>{card.title}</h3>
                        <p
                            className={`${styles.contactValue} ${
                                card.isPlaceholder ? styles.contactValuePlaceholder : ""
                            }`}
                        >
                            {card.value}
                        </p>
                        <p className={styles.infoCardText}>{card.hint}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}

function NewcomersTab() {
    return (
        <div className={styles.sectionStack}>
            <p className={styles.sectionLead}>
                Эта вкладка снижает количество одинаковых вопросов от новых участников и сразу
                задает понятный стандарт первого посещения.
            </p>

            <div className={styles.cardGrid}>
                {NEWCOMER_SECTIONS.map((section) => (
                    <section key={section.title} className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>{section.title}</h3>
                        <ul className={styles.checklist}>
                            {section.items.map((item, index) => (
                                <li key={`${section.title}-${index}`} className={styles.checklistItem}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            <div className={styles.actionRow}>
                <Link className={styles.primaryAction} to="/timetable">
                    Открыть тренировки
                </Link>
                <Link className={styles.secondaryAction} to="/schedule">
                    Посмотреть афишу
                </Link>
            </div>
        </div>
    );
}

export function AboutPage() {
    const [page, setPage] = useState<InfoPageResponse | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isRulesLoading, setIsRulesLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [rulesError, setRulesError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;

        setIsPageLoading(true);
        setPageError(null);
        aboutApi
            .getAboutPage()
            .then((data) => {
                if (!cancelled) {
                    setPage(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPageError("Не удалось загрузить информацию о клубе.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsPageLoading(false);
                }
            });

        setIsRulesLoading(true);
        setRulesError(null);
        getRules()
            .then((data) => {
                if (!cancelled) {
                    setRules(data.map(toRule).sort((a, b) => a.sortOrder - b.sortOrder));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setRulesError("Не удалось загрузить правила клуба.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsRulesLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (isPageLoading) {
        return <div className={styles.stateCard}>Загружаем информацию о клубе…</div>;
    }

    if (pageError || !page) {
        return (
            <div className={styles.stateCard}>
                {pageError ?? "Информация о клубе пока недоступна."}
            </div>
        );
    }

    const updatedAt = formatUpdatedAt(page.updatedAt);
    const activeTab = resolveActiveTab(location.pathname);

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroBadge}>ROUND 13</div>

                <div className={styles.heroContent}>
                    <div className={styles.heroCopy}>
                        <h2 className={styles.title}>{page.title}</h2>
                        <p className={styles.heroLead}>
                            Собрали в одном месте общий текст о клубе, правила, контакты и блок
                            для новичков, чтобы раздел выглядел как полноценный информационный хаб.
                        </p>
                    </div>

                    <div className={styles.heroMeta}>
                        <article className={styles.metaCard}>
                            <span className={styles.metaLabel}>Разделы</span>
                            <strong className={styles.metaValue}>4 вкладки внутри страницы</strong>
                        </article>

                        <article className={styles.metaCard}>
                            <span className={styles.metaLabel}>Сейчас открыто</span>
                            <strong className={styles.metaValue}>{activeTab.label}</strong>
                        </article>

                        {updatedAt && (
                            <article className={styles.metaCard}>
                                <span className={styles.metaLabel}>Обновлено</span>
                                <strong className={styles.metaValue}>{updatedAt}</strong>
                            </article>
                        )}
                    </div>
                </div>
            </section>

            <nav className={styles.tabs} aria-label="Разделы страницы О нас">
                {ABOUT_TABS.map((tab) => (
                    <NavLink
                        key={tab.id}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) =>
                            `${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`
                        }
                    >
                        <span className={styles.tabLabel}>{tab.label}</span>
                        <span className={styles.tabHint}>{tab.hint}</span>
                    </NavLink>
                ))}
            </nav>

            <section className={styles.panel}>
                <Outlet
                    context={{
                        page,
                        rules,
                        isRulesLoading,
                        rulesError,
                    }}
                />
            </section>
        </div>
    );
}

export function AboutOverviewPage() {
    const { page } = useAboutContext();

    return <OverviewTab page={page} />;
}

export function AboutRulesPage() {
    const { rules, isRulesLoading, rulesError } = useAboutContext();

    return <RulesTab rules={rules} loading={isRulesLoading} error={rulesError} />;
}

export function AboutContactsPage() {
    return <ContactsTab />;
}

export function AboutNewcomersPage() {
    return <NewcomersTab />;
}

export default AboutPage;
