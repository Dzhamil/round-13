import styled from "styled-components";

const TG_BG = "#17212b";
const TG_SECONDARY = "#232e3c";
const TG_ELEVATED = "#1d2834";
const TG_TEXT = "#f5f5f5";
const TG_HINT = "#8b9bb0";
const TG_BORDER = "rgba(255,255,255,0.08)";
const TG_ACCENT = "#6ab3f3";
const TG_DANGER = "#d95b5b";
const TG_SUCCESS = "#63d28f";
const TG_WARNING = "#f2b55a";

export const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.78);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 12px;
    z-index: 200;
`;

export const ModalContainer = styled.div`
    width: 560px;
    max-width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    background: linear-gradient(180deg, ${TG_BG} 0%, ${TG_ELEVATED} 100%);
    border: 1px solid ${TG_BORDER};
    border-radius: 18px;
    padding: 20px;
    color: ${TG_TEXT};
    position: relative;
    box-shadow: 0 28px 60px rgba(0, 0, 0, 0.34);
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

export const Section = styled.section`
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${TG_BORDER};
`;

export const TabsRow = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
    align-items: stretch;
`;

export const TabButton = styled.button<{ $active: boolean }>`
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid ${({ $active }) => ($active ? TG_ACCENT : TG_BORDER)};
    background: ${({ $active }) => ($active ? "rgba(106,179,243,0.14)" : TG_SECONDARY)};
    color: ${({ $active }) => ($active ? TG_ACCENT : TG_TEXT)};
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    appearance: none;
    box-sizing: border-box;
`;

export const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
`;

export const SectionTitle = styled.h3`
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: ${TG_TEXT};
`;

export const SectionHint = styled.p`
    margin: 4px 0 0;
    color: ${TG_HINT};
    font-size: 12px;
    line-height: 1.45;
`;

export const SectionCard = styled.div`
    padding: 14px;
    border-radius: 14px;
    border: 1px solid ${TG_BORDER};
    background: rgba(255, 255, 255, 0.03);
`;

export const AboutBlock = styled.div`
    font-size: 14px;
    line-height: 1.55;
    color: ${TG_TEXT};
    white-space: pre-wrap;
`;

export const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`;

export const StatCard = styled.div`
    padding: 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid ${TG_BORDER};
`;

export const StatLabel = styled.div`
    color: ${TG_HINT};
    font-size: 12px;
    line-height: 1.4;
`;

export const StatValue = styled.div`
    margin-top: 6px;
    color: ${TG_TEXT};
    font-size: 16px;
    font-weight: 700;
`;

export const InlineNotice = styled.div`
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(106, 179, 243, 0.12);
    color: ${TG_ACCENT};
    font-size: 13px;
`;

export const ErrorBanner = styled.div`
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(217, 91, 91, 0.12);
    color: #ffb0b0;
    font-size: 13px;
    line-height: 1.45;
`;

export const LoadingText = styled.div`
    margin-top: 16px;
    color: ${TG_HINT};
    font-size: 14px;
`;

export const EmptyState = styled.div`
    padding: 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed ${TG_BORDER};
    color: ${TG_HINT};
    font-size: 13px;
    line-height: 1.55;
`;

export const StatusHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
`;

export const StatusBadge = styled.div<{ $tone: "positive" | "warning" | "danger" }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    color: ${({ $tone }) => ($tone === "positive" ? TG_SUCCESS : $tone === "danger" ? "#ffb0b0" : TG_WARNING)};
    background: ${({ $tone }) => (
        $tone === "positive"
            ? "rgba(99,210,143,0.12)"
            : $tone === "danger"
                ? "rgba(217,91,91,0.16)"
                : "rgba(242,181,90,0.14)"
    )};
`;

export const StatusDescription = styled.div`
    color: ${TG_HINT};
    font-size: 13px;
    line-height: 1.5;
`;

export const KeyValueList = styled.div`
    display: grid;
    gap: 10px;
`;

export const KeyValueRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 14px;
    font-size: 13px;
    line-height: 1.5;

    span:first-child {
        color: ${TG_HINT};
    }

    span:last-child {
        color: ${TG_TEXT};
        text-align: right;
    }
`;

export const NoteText = styled.div`
    font-size: 14px;
    line-height: 1.55;
    color: ${TG_TEXT};
    white-space: pre-wrap;
`;

export const MetaText = styled.div`
    color: ${TG_HINT};
    font-size: 12px;
    line-height: 1.45;
`;

export const FieldLabel = styled.label`
    display: block;
    color: ${TG_HINT};
    font-size: 12px;
    margin-bottom: 8px;
`;

export const TextArea = styled.textarea`
    width: 100%;
    min-height: 140px;
    resize: vertical;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${TG_BORDER};
    background: ${TG_SECONDARY};
    color: ${TG_TEXT};
    font-size: 14px;
    line-height: 1.5;
    outline: none;
`;

export const NumberInput = styled.input`
    width: 100%;
    height: 42px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid ${TG_BORDER};
    background: ${TG_SECONDARY};
    color: ${TG_TEXT};
    font-size: 14px;
    outline: none;
`;

export const ButtonRow = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
`;

export const PrimaryButton = styled.button`
    min-width: 140px;
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    border: none;
    background: ${TG_ACCENT};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.65;
        cursor: default;
    }
`;

export const SecondaryButton = styled.button`
    min-width: 88px;
    height: 42px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid ${TG_BORDER};
    background: ${TG_SECONDARY};
    color: ${TG_TEXT};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`;

export const DangerButton = styled(PrimaryButton)`
    background: ${TG_DANGER};
`;

export const BalanceControls = styled.div`
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr) 88px;
    gap: 10px;
    align-items: end;
`;

export const TimelineList = styled.div`
    display: grid;
    gap: 10px;
`;

export const TimelineItem = styled.div`
    padding: 12px;
    border-radius: 14px;
    border: 1px solid ${TG_BORDER};
    background: rgba(255, 255, 255, 0.03);
`;

export const TimelineTitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
`;

export const TimelineTitle = styled.div`
    color: ${TG_TEXT};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
`;

export const TrainingHistoryHeader = styled.div`
    color: ${TG_TEXT};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
`;

export const TrainingHistoryMetaRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
`;

export const StatusChip = styled.div`
    flex-shrink: 0;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid ${TG_BORDER};
    background: ${TG_SECONDARY};
    color: ${TG_TEXT};
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
`;

export const TimelineMeta = styled.div`
    margin-top: 6px;
    color: ${TG_HINT};
    font-size: 12px;
    line-height: 1.45;
`;

export const DeltaBadge = styled.div<{ $positive: boolean }>`
    min-width: 62px;
    text-align: right;
    color: ${({ $positive }) => ($positive ? TG_SUCCESS : "#ffb0b0")};
    font-size: 15px;
    font-weight: 700;
`;

export const Divider = styled.div`
    height: 1px;
    margin: 14px 0;
    background: ${TG_BORDER};
`;

export const ActionButton = styled(PrimaryButton)<{ $danger?: boolean }>`
    width: 100%;
    background: ${({ $danger }) => ($danger ? TG_DANGER : TG_ACCENT)};
`;
