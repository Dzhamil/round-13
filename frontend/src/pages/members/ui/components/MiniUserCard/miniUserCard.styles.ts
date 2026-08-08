// frontend/src/pages/members/ui/components/MiniUserCard/miniUserCard.styles.ts
import styled from "styled-components";

const TG_BG = "#17212b";
const TG_SECONDARY = "#232e3c";
const TG_TEXT = "#f5f5f5";
const TG_HINT = "#708499";
const TG_BORDER = "rgba(255,255,255,0.08)";
const TG_ACCENT = "#6ab3f3";

export const Root = styled.div<{ $clickable: boolean }>`
    position: relative;
    display: flex;
    min-height: 86px;
    border-bottom: 1px solid ${TG_BORDER};
    cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
    background: ${TG_BG};
    width: 100%;
    text-align: left;
`;

export const CardAction = styled.button`
    position: absolute;
    inset: 0;
    z-index: 1;
    border: none;
    padding: 0;
    cursor: pointer;
    background: transparent;

    &:focus-visible {
        outline: 2px solid ${TG_ACCENT};
        outline-offset: -2px;
    }
`;

export const CardContent = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 86px;
    padding: 12px 14px;
    pointer-events: none;
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

export const PhoneButton = styled.button`
    margin-top: 4px;
    font-size: 13px;
    color: ${TG_HINT};
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    opacity: 1;
    pointer-events: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;

    &:focus-visible {
        outline: 2px solid ${TG_ACCENT};
        outline-offset: 2px;
        border-radius: 4px;
    }
`;

export const PhoneText = styled.div`
    margin-top: 4px;
    font-size: 13px;
    color: ${TG_HINT};
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
`;

export const Status = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 92px;
    max-width: 42%;
`;

export const StatusLabel = styled.div`
    font-size: 12px;
    color: ${TG_HINT};
    text-align: right;
    line-height: 1.25;
    overflow-wrap: anywhere;
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
