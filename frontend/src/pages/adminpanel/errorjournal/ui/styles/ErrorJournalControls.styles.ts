import styled from "styled-components";

const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";
const BORDER = "rgba(255, 255, 255, 0.1)";

export const FiltersRoot = styled.form`
    display: grid;
    grid-template-columns: repeat(6, minmax(120px, 1fr));
    gap: 10px;
    align-items: end;
    min-width: 0;

    @media (max-width: 1100px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 620px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const Field = styled.label`
    display: grid;
    gap: 4px;
    min-width: 0;
    color: ${HINT};
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
`;

export const Input = styled.input`
    width: 100%;
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: ${TEXT};
    font-size: 13px;
    min-width: 0;
`;

export const Select = styled.select`
    width: 100%;
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    background: #141e2c;
    color: ${TEXT};
    font-size: 13px;
    min-width: 0;
`;

export const Actions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;

    @media (max-width: 620px) {
        justify-content: stretch;
    }
`;

export const Button = styled.button`
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: ${TEXT};
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;

    &[data-primary="true"] {
        border-color: rgba(90, 174, 255, 0.5);
        background: rgba(90, 174, 255, 0.18);
    }

    &:disabled {
        cursor: default;
        opacity: 0.55;
    }
`;
