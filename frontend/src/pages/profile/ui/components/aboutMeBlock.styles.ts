// frontend/src/pages/profile/ui/components/aboutMeBlock.styles.ts
import styled from "styled-components";

export const Container = styled.div`
  margin-top: 24px;
`;

export const Title = styled.div`
  font-size: 14px;
  color: #9c9c9c;
  margin-bottom: 8px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  resize: none;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  background: #111;
  color: #fff;
  padding: 10px;
  font-size: 14px;
`;

export const SaveButton = styled.button`
  margin-top: 8px;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: #ffffff;
  color: #000;
  font-weight: 600;
  cursor: pointer;
`;
