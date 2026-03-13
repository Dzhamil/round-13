// frontend/src/pages/members/ui/components/MemberDetailsModal/memberDetailsModal.styles.ts
import styled from "styled-components";

const TG_BG = "#17212b";
const TG_SECONDARY = "#232e3c";
const TG_TEXT = "#f5f5f5";
const TG_HINT = "#708499";
const TG_BORDER = "rgba(255,255,255,0.08)";
const TG_ACCENT = "#6ab3f3";
const TG_DANGER = "#c93a3a";

export const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
`;

export const ModalContainer = styled.div`
    width: 420px;
    max-width: 92%;
    background: ${TG_BG};
    border-radius: 16px;
    padding: 20px;
    color: ${TG_TEXT};
    position: relative;
`;

export const CloseButton = styled.button`
    position: absolute;
    right: 14px;
    top: 14px;
    border: none;
    background: transparent;
    color: ${TG_HINT};
    font-size: 18px;
    cursor: pointer;
`;

export const Section = styled.div`
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid ${TG_BORDER};
`;

export const SectionTitle = styled.div`
    font-size: 13px;
    color: ${TG_HINT};
    margin-bottom: 8px;
`;

export const AboutBlock = styled.div`
    font-size: 14px;
    line-height: 1.45;
    color: ${TG_TEXT};
    white-space: pre-wrap;
`;

export const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    font-size: 14px;
    color: ${TG_TEXT};

    span:last-child {
        color: ${TG_TEXT};
        text-align: right;
    }
`;

export const ErrorText = styled.div`
    margin-top: 16px;
    color: #ff8a8a;
    font-size: 14px;
`;

export const LoadingText = styled.div`
    margin-top: 16px;
    color: ${TG_HINT};
    font-size: 14px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
    width: 100%;
    height: 42px;
    margin-top: 10px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: ${(p) => (p.$danger ? TG_DANGER : TG_ACCENT)};
    color: white;
`;