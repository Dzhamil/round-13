import styled from "styled-components";

const PANEL_BG = "rgba(8, 13, 22, 0.88)";
const PANEL_BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const PageRoot = styled.main`
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    padding: 24px 32px;
    background: radial-gradient(circle at 50% 12%, #1f2a3a 0%, #0f1723 54%, #0b1220 100%);
    color: ${TEXT};
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    overflow-x: hidden;

    @media (max-width: 640px) {
        padding: 14px;
    }
`;

export const Panel = styled.section`
    display: grid;
    gap: 16px;
    width: 100%;
    max-width: 1160px;
    margin: 0 auto;
    padding: 18px;
    border: 1px solid ${PANEL_BORDER};
    border-radius: 16px;
    background:
        linear-gradient(180deg, rgba(35, 46, 60, 0.72), rgba(24, 33, 43, 0.68)),
        ${PANEL_BG};
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.24);
    min-width: 0;

    @media (max-width: 640px) {
        gap: 14px;
        padding: 14px;
        border-radius: 14px;
    }
`;

export const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-width: 0;

    @media (max-width: 640px) {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
    }
`;

export const HeadingGroup = styled.div`
    display: grid;
    gap: 4px;
    min-width: 0;
`;

export const Title = styled.h2`
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 800;
    color: ${TEXT};

    @media (max-width: 480px) {
        font-size: 20px;
    }
`;

export const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;

    @media (max-width: 640px) {
        width: 100%;
        justify-content: space-between;
    }
`;

export const Loading = styled.div`
    min-height: 18px;
    color: ${HINT};
    font-size: 12px;
    line-height: 1.4;
`;

export const ErrorSlot = styled.div`
    padding: 10px 12px;
    border: 1px solid rgba(255, 107, 107, 0.18);
    border-radius: 12px;
    background: rgba(255, 107, 107, 0.08);
`;
