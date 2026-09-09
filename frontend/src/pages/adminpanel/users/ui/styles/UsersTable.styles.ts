import styled from "styled-components";

const TABLE_COLUMNS =
    "minmax(96px, 0.75fr) minmax(180px, 1.35fr) minmax(78px, 0.45fr) minmax(88px, 0.45fr) minmax(300px, 1.2fr)";
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

    @media (max-width: 760px) {
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

    @media (max-width: 760px) {
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

    @media (max-width: 760px) {
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

export const MainCell = styled(Cell)`
    display: grid;
    gap: 3px;
    font-size: 14px;
`;

export const SubText = styled.div`
    color: ${HINT};
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
`;

export const ActionsCell = styled(Cell)`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 760px) {
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
