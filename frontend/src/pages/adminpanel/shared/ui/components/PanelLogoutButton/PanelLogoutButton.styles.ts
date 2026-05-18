import styled from "styled-components";

const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const LogoutButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-height: 38px;
    padding: 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    color: ${TEXT};
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition:
        transform 160ms ease,
        border-color 160ms ease,
        background 160ms ease,
        color 160ms ease;

    &:hover {
        transform: translateY(-1px);
        border-color: rgba(142, 197, 255, 0.26);
        background: rgba(255, 255, 255, 0.07);
        color: ${TEXT};
    }

    &:focus-visible {
        outline: 2px solid rgba(142, 197, 255, 0.82);
        outline-offset: 2px;
    }

    &:disabled {
        cursor: default;
        opacity: 0.65;
        transform: none;
        color: ${HINT};
    }

    @media (max-width: 420px) {
        min-height: 40px;
        padding: 0 12px;
        font-size: 12px;
    }
`;
