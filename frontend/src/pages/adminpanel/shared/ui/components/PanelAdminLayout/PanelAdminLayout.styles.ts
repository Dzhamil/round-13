import styled from "styled-components";

export const Page = styled.main`
    height: 100vh;
    height: 100dvh;
    width: 100%;
    padding: 24px 32px;
    background: radial-gradient(circle at 50% 12%, #1f2a3a 0%, #0f1723 54%, #0b1220 100%);
    color: var(--tg-theme-text-color, #e6edf3);
    overflow: hidden;

    @media (max-width: 640px) {
        padding: 14px;
    }
`;

export const Panel = styled.section`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-width: 1160px;
    min-width: 0;
    margin: 0 auto;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(35, 46, 60, 0.72), rgba(24, 33, 43, 0.68)), rgba(8, 13, 22, 0.88);
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.24);

    @media (max-width: 640px) {
        padding: 14px;
        border-radius: 14px;
    }
`;

export const Header = styled.header`
    flex: none;
    display: grid;
    gap: 12px;
    padding-bottom: 16px;
    min-width: 0;
`;

export const TitleRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;
`;

// Reserve the longest title's natural height, including wrapping on narrow screens.
export const TitleSlot = styled.div`
    display: grid;
    min-width: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 800;
    overflow-wrap: anywhere;

    @media (max-width: 640px) {
        font-size: 20px;
    }
`;

export const TitleReserve = styled.span`
    grid-area: 1 / 1;
    visibility: hidden;
`;

export const Title = styled.h1`
    grid-area: 1 / 1;
    margin: 0;
    font: inherit;
`;

export const Content = styled.div`
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: auto;
    scrollbar-gutter: stable;
    overflow-wrap: anywhere;
    display: flex;
    flex-direction: column;
    gap: 16px;

    > * {
        flex-shrink: 0;
        min-width: 0;
    }

    input:not([type="checkbox"]), select, textarea {
        min-width: 0;
        max-width: 100%;
    }
`;
