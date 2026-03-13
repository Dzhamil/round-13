// frontend/src/pages/profile/ui/components/aboutMeBlock.styles.ts
import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  gap: 10px;
`;

export const Hint = styled.div<{ $error?: boolean }>`
  font-size: 13px;
  line-height: 1.45;
  color: ${({ $error }) => ($error ? "#ffb4b4" : "var(--tg-theme-hint-color, rgba(255,255,255,0.64))")};
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: var(--tg-theme-text-color, #f5f5f5);
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
`;

export const SaveButton = styled.button`
  justify-self: start;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #ffffff;
  color: #000;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
