import { useEffect, useState } from "react";
import type { ErrorJournalDetail, ErrorJournalStatus } from "../../api/panelErrorJournal.api";
import ErrorText from "../../../../../shared/ui/ErrorText";
import * as S from "../styles/ErrorJournalDetail.styles";

type Props = {
    detail: ErrorJournalDetail | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    onClose: () => void;
    onSaveStatus: (status: ErrorJournalStatus, note: string) => void;
};

function valueOrDash(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === "" ? "—" : String(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(new Date(value));
}

export function ErrorJournalDetailDrawer(props: Props) {
    const { detail, isLoading, isSaving, error, onClose, onSaveStatus } = props;
    const [status, setStatus] = useState<ErrorJournalStatus>("OPEN");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (detail) {
            setStatus(detail.status);
            setNote(detail.resolutionNote ?? "");
        }
    }, [detail]);

    if (!detail && !isLoading && !error) {
        return <S.Placeholder>Выберите запись, чтобы открыть stack trace и request metadata.</S.Placeholder>;
    }

    return (
        <S.Root aria-label="Детали ошибки">
            <S.Header>
                <S.Title>{detail ? detail.exceptionClass ?? detail.errorType ?? detail.id : "Загрузка"}</S.Title>
                <S.CloseButton type="button" onClick={onClose} aria-label="Закрыть детали">×</S.CloseButton>
            </S.Header>

            {isLoading && <S.Placeholder>Загрузка…</S.Placeholder>}
            {error && <ErrorText message={error} />}

            {detail && (
                <>
                    <S.Section>
                        <S.SectionTitle>Request</S.SectionTitle>
                        <S.MetaGrid>
                            <dt>Occurred</dt><dd>{formatDate(detail.occurredAt)}</dd>
                            <dt>HTTP</dt><dd>{valueOrDash(detail.httpStatus)}</dd>
                            <dt>Code</dt><dd>{valueOrDash(detail.errorCode)}</dd>
                            <dt>Method</dt><dd>{valueOrDash(detail.requestMethod)}</dd>
                            <dt>Path</dt><dd>{valueOrDash(detail.requestPath)}</dd>
                            <dt>Query</dt><dd>{valueOrDash(detail.queryString)}</dd>
                            <dt>Request ID</dt><dd>{valueOrDash(detail.requestId)}</dd>
                            <dt>Fingerprint</dt><dd>{detail.fingerprint}</dd>
                            <dt>Actor</dt><dd>{valueOrDash(detail.actorUserId)}</dd>
                            <dt>Panel admin</dt><dd>{valueOrDash(detail.panelAdminId)}</dd>
                            <dt>Remote</dt><dd>{valueOrDash(detail.remoteAddr)}</dd>
                            <dt>User agent</dt><dd>{valueOrDash(detail.userAgent)}</dd>
                        </S.MetaGrid>
                    </S.Section>

                    <S.Section>
                        <S.SectionTitle>Exception</S.SectionTitle>
                        <S.MetaGrid>
                            <dt>Class</dt><dd>{valueOrDash(detail.exceptionClass)}</dd>
                            <dt>Type</dt><dd>{valueOrDash(detail.errorType)}</dd>
                            <dt>Message</dt><dd>{valueOrDash(detail.message)}</dd>
                        </S.MetaGrid>
                        <S.StackTrace>{detail.stackTrace || "—"}</S.StackTrace>
                    </S.Section>

                    <S.Section>
                        <S.SectionTitle>Status</S.SectionTitle>
                        <S.StatusForm
                            onSubmit={(event) => {
                                event.preventDefault();
                                onSaveStatus(status, note);
                            }}
                        >
                            <S.Select value={status} onChange={(event) => setStatus(event.target.value as ErrorJournalStatus)}>
                                <option value="OPEN">OPEN</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="IGNORED">IGNORED</option>
                            </S.Select>
                            <S.Textarea value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} />
                            <S.MetaGrid>
                                <dt>Resolved at</dt><dd>{formatDate(detail.resolvedAt)}</dd>
                                <dt>Resolved by</dt><dd>{valueOrDash(detail.resolvedByUserId)}</dd>
                            </S.MetaGrid>
                            <S.SaveButton type="submit" disabled={isSaving}>
                                {isSaving ? "Сохранение…" : "Сохранить статус"}
                            </S.SaveButton>
                        </S.StatusForm>
                    </S.Section>
                </>
            )}
        </S.Root>
    );
}
