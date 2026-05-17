// frontend/src/pages/members/ui/components/MiniUserCard/miniUserCard.styles.ts
import styled from "styled-components";

const TG_BG = "#17212b";
const TG_SECONDARY = "#232e3c";
const TG_TEXT = "#f5f5f5";
const TG_HINT = "#708499";
const TG_BORDER = "rgba(255,255,255,0.08)";
const TG_ACCENT = "#6ab3f3";

export const Root = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 86px;
    padding: 12px 14px;
    border: none;
    border-bottom: 1px solid ${TG_BORDER};
    cursor: pointer;
    background: ${TG_BG};
    width: 100%;
    text-align: left;
`;

export const AvatarWrap = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    flex: 0 0 56px;
    background: ${TG_SECONDARY};
`;

export const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

export const AvatarFallback = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${TG_SECONDARY};
    color: ${TG_TEXT};
    font-size: 18px;
    font-weight: 700;
`;

export const Info = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    min-width: 0;
`;

export const Nickname = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${TG_TEXT};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const PhoneButton = styled.button<{ $hasPhone: boolean }>`
    margin-top: 4px;
    font-size: 13px;
    color: ${TG_HINT};
    cursor: ${(p) => (p.$hasPhone ? "pointer" : "default")};
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    opacity: ${(p) => (p.$hasPhone ? 1 : 0.8)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;

    &:disabled {
        pointer-events: none;
    }
`;

export const Status = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 88px;
`;

export const StatusLabel = styled.div`
    font-size: 12px;
    color: ${TG_HINT};
    text-align: right;
`;

export const MetaText = styled.div`
    font-size: 12px;
    color: ${TG_TEXT};
    text-align: right;
`;

export const Points = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${TG_ACCENT};
  text-align: right;
`;
