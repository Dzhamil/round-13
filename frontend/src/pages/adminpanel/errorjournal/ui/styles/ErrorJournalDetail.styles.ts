import styled from "styled-components";

const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";
const BORDER = "rgba(255, 255, 255, 0.08)";

export const Root = styled.aside`
    position: sticky;
    top: 12px;
    display: grid;
    gap: 12px;
    min-width: 0;
    max-height: calc(100vh - 40px);
    overflow: auto;
    padding: 12px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);

    @media (max-width: 1080px) {
        position: static;
        max-height: none;
    }
`;

export const Placeholder = styled.div`
    padding: 18px 12px;
    color: ${HINT};
    font-size: 13px;
    line-height: 1.4;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: start;
`;

export const Title = styled.h3`
    margin: 0;
    color: ${TEXT};
    font-size: 16px;
    line-height: 1.25;
    overflow-wrap: anywhere;
`;

export const CloseButton = styled.button`
    min-width: 32px;
    min-height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    color: ${TEXT};
    cursor: pointer;
`;

export const Section = styled.section`
    display: grid;
    gap: 8px;
    min-width: 0;
`;

export const SectionTitle = styled.h4`
    margin: 0;
    color: ${HINT};
    font-size: 11px;
    line-height: 1.2;
    font-weight: 800;
    text-transform: uppercase;
`;

export const MetaGrid = styled.dl`
    display: grid;
    grid-template-columns: minmax(96px, 0.4fr) minmax(0, 1fr);
    gap: 6px 10px;
    margin: 0;
    min-width: 0;
    font-size: 12px;
    line-height: 1.35;

    dt {
        color: ${HINT};
        font-weight: 700;
    }

    dd {
        margin: 0;
        min-width: 0;
        color: ${TEXT};
        overflow-wrap: anywhere;
    }
`;

export const StackTrace = styled.pre`
    max-height: 320px;
    margin: 0;
    padding: 10px;
    border: 1px solid ${BORDER};
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.28);
    color: ${TEXT};
    font-size: 11px;
    line-height: 1.45;
    overflow: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
`;

export const StatusForm = styled.form`
    display: grid;
    gap: 8px;
`;

export const Select = styled.select`
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: #141e2c;
    color: ${TEXT};
`;

export const Textarea = styled.textarea`
    min-height: 72px;
    resize: vertical;
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: ${TEXT};
`;

export const SaveButton = styled.button`
    min-height: 36px;
    border: 1px solid rgba(90, 174, 255, 0.5);
    border-radius: 8px;
    background: rgba(90, 174, 255, 0.18);
    color: ${TEXT};
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;

    &:disabled {
        cursor: default;
        opacity: 0.55;
    }
`;
