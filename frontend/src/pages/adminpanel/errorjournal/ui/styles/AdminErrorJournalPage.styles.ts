import styled from "styled-components";

const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

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
