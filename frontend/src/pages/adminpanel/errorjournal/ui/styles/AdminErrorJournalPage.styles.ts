import styled from "styled-components";

const PANEL_BG = "rgba(8, 13, 22, 0.9)";
const PANEL_BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const PageRoot = styled.main`
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    padding: 20px 24px;
    background: radial-gradient(circle at 52% 10%, #263142 0%, #101824 50%, #0b111d 100%);
    color: ${TEXT};
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    overflow-x: hidden;

    @media (max-width: 720px) {
        padding: 12px;
    }
`;

export const Panel = styled.section`
    display: grid;
    gap: 14px;
    width: 100%;
    max-width: 1380px;
    margin: 0 auto;
    padding: 16px;
    border: 1px solid ${PANEL_BORDER};
    border-radius: 8px;
    background:
        linear-gradient(180deg, rgba(35, 46, 60, 0.72), rgba(24, 33, 43, 0.7)),
        ${PANEL_BG};
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
    min-width: 0;
`;

export const Header = styled.header`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
    min-width: 0;

    @media (max-width: 760px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const HeadingGroup = styled.div`
    display: grid;
    gap: 8px;
    min-width: 0;
`;

export const Title = styled.h2`
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 800;
    color: ${TEXT};
`;

export const HeaderActions = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
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
    border-radius: 8px;
    background: rgba(255, 107, 107, 0.08);
`;

export const WorkArea = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
    gap: 14px;
    align-items: start;
    min-width: 0;

    @media (max-width: 1080px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const MainColumn = styled.div`
    display: grid;
    gap: 12px;
    min-width: 0;
`;

export const Pagination = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    color: ${HINT};
    font-size: 12px;
`;

export const PagerButton = styled.button`
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    color: ${TEXT};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;
