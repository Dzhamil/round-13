import styled from "styled-components";

const ACCENT = "var(--tg-theme-button-color, #2ea6ff)";
const TEXT = "var(--tg-theme-text-color, #e6edf3)";

export const ActionButton = styled.button<{ $tone?: "primary" | "danger" }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 112px;
    max-width: 176px;
    min-height: 38px;
    padding: 7px 12px;
    border-radius: 10px;
    border: 1px solid
        ${({ $tone }) =>
            $tone === "danger" ? "rgba(255, 107, 107, 0.28)" : "rgba(46, 166, 255, 0.3)"};
    background: ${({ $tone }) =>
        $tone === "danger" ? "rgba(255, 107, 107, 0.1)" : "rgba(46, 166, 255, 0.14)"};
    color: ${({ $tone }) => ($tone === "danger" ? "var(--tg-theme-destructive-text-color, #ff6b6b)" : TEXT)};
    font-size: 12px;
    font-weight: 800;
    line-height: 1.15;
    text-align: center;
    white-space: normal;
    cursor: pointer;
    transition:
        transform 160ms ease,
        border-color 160ms ease,
        background 160ms ease,
        color 160ms ease,
        opacity 160ms ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: ${({ $tone }) =>
            $tone === "danger" ? "rgba(255, 107, 107, 0.44)" : "rgba(46, 166, 255, 0.5)"};
        background: ${({ $tone }) =>
            $tone === "danger" ? "rgba(255, 107, 107, 0.15)" : "rgba(46, 166, 255, 0.2)"};
        color: ${({ $tone }) => ($tone === "danger" ? "var(--tg-theme-destructive-text-color, #ff6b6b)" : ACCENT)};
    }

    &:focus-visible {
        outline: 2px solid rgba(142, 197, 255, 0.82);
        outline-offset: 2px;
    }

    &:disabled {
        cursor: default;
        opacity: 0.62;
        transform: none;
    }

    @media (max-width: 760px) {
        width: 100%;
        min-width: 0;
        max-width: none;
        min-height: 40px;
        padding: 7px 10px;
    }
`;
