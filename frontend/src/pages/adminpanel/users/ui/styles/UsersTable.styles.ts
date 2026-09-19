import styled from "styled-components";

const TABLE_COLUMNS =
    "minmax(80px, 0.7fr) minmax(140px, 1.3fr) minmax(90px, 0.8fr) minmax(110px, 0.9fr) minmax(78px, 0.6fr) minmax(88px, 0.6fr) 176px";
const BORDER = "rgba(255, 255, 255, 0.08)";
const ROW_BG = "rgba(255, 255, 255, 0.035)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const Root = styled.div`
    display: grid;
    gap: 8px;
    width: 100%;
    min-width: 0;
`;

export const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: ${TABLE_COLUMNS};
    gap: 10px;
    align-items: center;
    padding: 0 12px 4px;
    color: ${HINT};
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;

    @media (max-width: 1100px) {
        display: none;
    }
`;

export const Row = styled.div`
    display: grid;
    grid-template-columns: ${TABLE_COLUMNS};
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding: 12px;
    border: 1px solid ${BORDER};
    border-radius: 12px;
    background: ${ROW_BG};

    @media (max-width: 1100px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
        padding: 12px;
        border-radius: 14px;
    }
`;

export const Cell = styled.div`
    min-width: 0;
    color: ${TEXT};
    font-size: 13px;
    line-height: 1.35;
    overflow-wrap: anywhere;

    &::before {
        display: none;
    }

    @media (max-width: 1100px) {
        display: grid;
        grid-template-columns: 82px minmax(0, 1fr);
        gap: 10px;
        align-items: start;

        &::before {
            content: attr(data-label);
            display: block;
            color: ${HINT};
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
        }
    }
`;

export const HeaderCell = styled.div`
    min-width: 0;
    overflow-wrap: anywhere;
`;

export const IdCell = styled(Cell)`
    font-size: 12px;
    color: rgba(230, 237, 243, 0.82);
`;

export const SortButton = styled.button`
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
`;

export const MobileSort = styled.div`
    display: none;
    @media (max-width: 1100px) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        label { display: flex; gap: 8px; align-items: center; }
        select, button { padding: 8px; max-width: 100%; }
    }
`;

export const ActionsCell = styled(Cell)`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;

    @media (max-width: 1100px) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: stretch;
        justify-content: stretch;

        &::before {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 420px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;
