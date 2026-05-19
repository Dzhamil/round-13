import styled from "styled-components";

const PANEL_BG = "rgba(8, 13, 22, 0.9)";
const PANEL_BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";
const ACCENT = "var(--tg-theme-button-color, #2ea6ff)";

export const LoginPage = styled.main`
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    grid-template-rows: minmax(28px, 0.46fr) auto minmax(28px, 0.74fr);
    width: 100%;
    padding: 24px 16px;
    background: radial-gradient(circle at 50% 18%, #1f2a3a 0%, #0f1723 54%, #0b1220 100%);
    color: ${TEXT};
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    overflow-x: hidden;
`;

export const LoginPanelFrame = styled.div`
    grid-row: 2;
    width: min(100%, 460px);
    margin: 0 auto;
`;

export const Root = styled.div`
    display: grid;
    gap: 14px;
    width: 100%;
    padding: 22px;
    border: 1px solid ${PANEL_BORDER};
    border-radius: 16px;
    background:
        linear-gradient(180deg, rgba(35, 46, 60, 0.78), rgba(24, 33, 43, 0.72)),
        ${PANEL_BG};
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.28);

    @media (max-width: 480px) {
        padding: 16px;
        border-radius: 14px;
    }
`;

export const Title = styled.h2`
    margin: 0 0 4px;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 800;
    color: ${TEXT};
`;

export const FieldLabel = styled.label`
    display: grid;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: ${HINT};
`;

export const TextInput = styled.input`
    width: 100%;
    min-height: 44px;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 12px;
    outline: none;
    background: rgba(6, 10, 17, 0.78);
    color: ${TEXT};
    transition:
        border-color 160ms ease,
        box-shadow 160ms ease,
        background 160ms ease;

    &:focus {
        border-color: ${ACCENT};
        box-shadow: 0 0 0 3px rgba(46, 166, 255, 0.14);
        background: rgba(7, 12, 20, 0.92);
    }
`;

export const SubmitButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid ${ACCENT};
    border-radius: 12px;
    background: ${ACCENT};
    color: var(--tg-theme-button-text-color, #ffffff);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.2;
    cursor: pointer;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24);
    transition:
        transform 160ms ease,
        opacity 160ms ease,
        box-shadow 160ms ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 16px 30px rgba(0, 0, 0, 0.28);
    }

    &:focus-visible {
        outline: 2px solid rgba(142, 197, 255, 0.82);
        outline-offset: 2px;
    }

    &:disabled {
        cursor: default;
        opacity: 0.65;
        transform: none;
        box-shadow: none;
    }
`;

export const ErrorSlot = styled.div`
    margin-top: -2px;
`;
