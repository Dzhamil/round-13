import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styled from "styled-components";

const tabs = [
    { id: "stats", label: "Общая статистика", icon: "profile-tab-stats.png" },
    { id: "potential", label: "Потенциал боксёра", icon: "profile-tab-boxer-potential.png" },
    { id: "packages", label: "Мои пакеты", icon: "profile-tab-packages.png" },
    { id: "verification", label: "Верификация тренера", icon: "profile-tab-trainer-verification.png" },
] as const;

type TabId = typeof tabs[number]["id"];
type Props = { panels: Record<TabId, ReactNode> };

const TabList = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    min-width: 0;
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 64px;
    padding: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(24, 33, 43, 0.88);
    cursor: pointer;

    &[aria-selected="true"] {
        background: rgba(65, 80, 96, 0.95);
        border-color: rgba(255, 255, 255, 0.65);
        box-shadow: inset 0 -3px 0 rgba(255, 255, 255, 0.75);
    }

    &:focus-visible {
        outline: 2px solid white;
        outline-offset: 2px;
    }

    img {
        display: block;
        width: 52px;
        height: 52px;
        max-width: 100%;
        object-fit: contain;
    }
`;

export function ProfileTabs({ panels }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>("stats");
    const id = useId();
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let next: number;
        switch (event.key) {
            case "ArrowRight": next = (index + 1) % tabs.length; break;
            case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
            case "Home": next = 0; break;
            case "End": next = tabs.length - 1; break;
            default: return;
        }
        event.preventDefault();
        setActiveTab(tabs[next].id);
        buttons.current[next]?.focus();
    }

    return (
        <>
            <TabList role="tablist" aria-label="Разделы профиля">
                {tabs.map((tab, index) => (
                    <TabButton
                        key={tab.id}
                        ref={(element) => { buttons.current[index] = element; }}
                        type="button"
                        role="tab"
                        id={`${id}-tab-${tab.id}`}
                        aria-controls={`${id}-panel-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-label={tab.label}
                        title={tab.label}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        <img src={`/images/profile-tabs/${tab.icon}`} alt="" draggable={false} />
                    </TabButton>
                ))}
            </TabList>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    id={`${id}-panel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={`${id}-tab-${tab.id}`}
                    hidden={activeTab !== tab.id}
                    tabIndex={0}
                    style={{ minWidth: 0 }}
                >
                    {activeTab === tab.id ? panels[tab.id] : null}
                </div>
            ))}
        </>
    );
}
