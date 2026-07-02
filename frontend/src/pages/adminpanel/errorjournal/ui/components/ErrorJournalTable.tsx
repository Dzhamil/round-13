import type { ErrorJournalListItem } from "../../api/panelErrorJournal.api";
import * as S from "../styles/ErrorJournalTable.styles";

type Props = {
    items: ErrorJournalListItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "short",
        timeStyle: "medium",
    }).format(new Date(value));
}

function shortId(value: string | null): string {
    return value ? value.slice(0, 8) : "—";
}

export function ErrorJournalTable({ items, selectedId, onSelect }: Props) {
    if (items.length === 0) {
        return <S.Empty>Записей не найдено</S.Empty>;
    }

    return (
        <S.Root>
            <S.HeaderRow>
                <S.HeaderCell>Время</S.HeaderCell>
                <S.HeaderCell>Тип</S.HeaderCell>
                <S.HeaderCell>HTTP/code</S.HeaderCell>
                <S.HeaderCell>Endpoint</S.HeaderCell>
                <S.HeaderCell>Message</S.HeaderCell>
                <S.HeaderCell>Actor</S.HeaderCell>
                <S.HeaderCell>Status</S.HeaderCell>
            </S.HeaderRow>

            {items.map((item) => (
                <S.Row
                    key={item.id}
                    type="button"
                    data-selected={selectedId === item.id}
                    onClick={() => onSelect(item.id)}
                >
                    <S.Cell data-label="Время">{formatDate(item.occurredAt)}</S.Cell>
                    <S.Cell data-label="Тип">
                        <S.Badge>{item.severity}</S.Badge>{" "}
                        <S.Muted>{item.source}</S.Muted>
                    </S.Cell>
                    <S.Cell data-label="HTTP/code">{item.httpStatus ?? "—"} / {item.errorCode ?? "—"}</S.Cell>
                    <S.Cell data-label="Endpoint">{item.requestMethod ?? "—"} {item.requestPath ?? "—"}</S.Cell>
                    <S.Cell data-label="Message">{item.message || item.exceptionClass || "—"}</S.Cell>
                    <S.Cell data-label="Actor">{shortId(item.actorUserId ?? item.panelAdminId)}</S.Cell>
                    <S.Cell data-label="Status"><S.Badge>{item.status}</S.Badge></S.Cell>
                </S.Row>
            ))}
        </S.Root>
    );
}
