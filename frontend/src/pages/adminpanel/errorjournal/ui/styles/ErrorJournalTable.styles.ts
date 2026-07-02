import styled from "styled-components";

const TABLE_COLUMNS =
    "minmax(128px, 0.8fr) minmax(98px, 0.55fr) minmax(96px, 0.5fr) minmax(240px, 1.15fr) minmax(220px, 1fr) minmax(78px, 0.4fr) minmax(88px, 0.45fr)";
const BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const Root = styled.div`
    display: grid;
    gap: 8px;
    min-width: 0;
`;

export const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: ${TABLE_COLUMNS};
    gap: 8px;
    padding: 0 10px 2px;
    color: ${HINT};
    font-size: 11px;
    font-weight: 800;

    @media (max-width: 940px) {
        display: none;
    }
`;

export const Row = styled.button`
    display: grid;
    grid-template-columns: ${TABLE_COLUMNS};
    gap: 8px;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: 10px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
    color: ${TEXT};
    text-align: left;
    cursor: pointer;

    &[data-selected="true"] {
        border-color: rgba(90, 174, 255, 0.45);
        background: rgba(90, 174, 255, 0.1);
    }

    @media (max-width: 940px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
    }
`;

export const Cell = styled.div`
    min-width: 0;
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;

    &::before {
        display: none;
    }

    @media (max-width: 940px) {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        gap: 10px;

        &::before {
            content: attr(data-label);
            display: block;
            color: ${HINT};
            font-size: 11px;
            font-weight: 800;
        }
    }
`;

export const HeaderCell = styled.div`
    min-width: 0;
`;

export const Muted = styled.span`
    color: ${HINT};
`;

export const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.045);
    color: ${TEXT};
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
`;

export const Empty = styled.div`
    padding: 20px 12px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    color: ${HINT};
    font-size: 13px;
    text-align: center;
`;
