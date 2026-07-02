import type { ErrorJournalFilters as ErrorJournalFiltersValue } from "../../api/panelErrorJournal.api";
import * as S from "../styles/ErrorJournalControls.styles";

type Props = {
    filters: ErrorJournalFiltersValue;
    onChange: (filters: ErrorJournalFiltersValue) => void;
    onApply: () => void;
    onReset: () => void;
};

export function ErrorJournalFilters({ filters, onChange, onApply, onReset }: Props) {
    function update(key: keyof ErrorJournalFiltersValue, value: string): void {
        onChange({ ...filters, [key]: value });
    }

    return (
        <S.FiltersRoot
            onSubmit={(event) => {
                event.preventDefault();
                onApply();
            }}
        >
            <S.Field>
                Статус
                <S.Select value={filters.status ?? "OPEN"} onChange={(event) => update("status", event.target.value)}>
                    <option value="OPEN">OPEN</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="IGNORED">IGNORED</option>
                    <option value="ALL">Все</option>
                </S.Select>
            </S.Field>
            <S.Field>
                Severity
                <S.Select value={filters.severity ?? "ALL"} onChange={(event) => update("severity", event.target.value)}>
                    <option value="ALL">Все</option>
                    <option value="ERROR">ERROR</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="CLIENT_ERROR">CLIENT_ERROR</option>
                </S.Select>
            </S.Field>
            <S.Field>
                Source
                <S.Select value={filters.source ?? "ALL"} onChange={(event) => update("source", event.target.value)}>
                    <option value="ALL">Все</option>
                    <option value="BACKEND">BACKEND</option>
                    <option value="FRONTEND">FRONTEND</option>
                </S.Select>
            </S.Field>
            <S.Field>
                HTTP
                <S.Input value={filters.httpStatus ?? ""} inputMode="numeric" onChange={(event) => update("httpStatus", event.target.value)} />
            </S.Field>
            <S.Field>
                Path
                <S.Input value={filters.path ?? ""} onChange={(event) => update("path", event.target.value)} />
            </S.Field>
            <S.Field>
                Search
                <S.Input value={filters.q ?? ""} onChange={(event) => update("q", event.target.value)} />
            </S.Field>
            <S.Field>
                From
                <S.Input type="datetime-local" value={filters.from ?? ""} onChange={(event) => update("from", event.target.value)} />
            </S.Field>
            <S.Field>
                To
                <S.Input type="datetime-local" value={filters.to ?? ""} onChange={(event) => update("to", event.target.value)} />
            </S.Field>
            <S.Field>
                Error code
                <S.Input value={filters.errorCode ?? ""} onChange={(event) => update("errorCode", event.target.value)} />
            </S.Field>
            <S.Actions>
                <S.Button type="submit" data-primary="true">Применить</S.Button>
                <S.Button type="button" onClick={onReset}>Сброс</S.Button>
            </S.Actions>
        </S.FiltersRoot>
    );
}
