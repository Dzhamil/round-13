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
    border-radius: 12px;
    background: rgba(255, 107, 107, 0.08);
`;

export const PasswordNotice = styled.div`
    display: grid;
    gap: 10px;
    padding: 12px;
    border: 1px solid rgba(46, 166, 255, 0.32);
    border-radius: 12px;
    background: rgba(46, 166, 255, 0.1);
`;

export const PasswordText = styled.div`
    overflow-wrap: anywhere;

    code {
        user-select: all;
        font-size: 15px;
    }
`;

export const PasswordActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    button {
        min-height: 36px;
        padding: 7px 12px;
        border: 1px solid rgba(46, 166, 255, 0.3);
        border-radius: 10px;
        background: rgba(46, 166, 255, 0.14);
        color: ${TEXT};
        cursor: pointer;
    }
`;

export const CopyError = styled.span`
    color: #ffb4b4;
    font-size: 12px;
`;
