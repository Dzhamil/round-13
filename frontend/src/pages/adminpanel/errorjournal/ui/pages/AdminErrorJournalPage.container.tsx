import ErrorText from "../../../../../shared/ui/ErrorText";
import { usePanelErrorJournal } from "../../model/usePanelErrorJournal";
import { ErrorJournalDetailDrawer } from "../components/ErrorJournalDetailDrawer";
import { ErrorJournalFilters } from "../components/ErrorJournalFilters";
import { ErrorJournalTable } from "../components/ErrorJournalTable";
import * as S from "../styles/AdminErrorJournalPage.styles";

export function AdminErrorJournalPageContainer() {
    const journal = usePanelErrorJournal();

    return (
        <>
            {journal.isLoading && <S.Loading>Загрузка…</S.Loading>}

            {journal.error && (
                <S.ErrorSlot>
                    <ErrorText message={journal.error} />
                </S.ErrorSlot>
            )}

            <S.WorkArea>
                <S.MainColumn>
                    <ErrorJournalFilters
                        filters={journal.draftFilters}
                        onChange={journal.setDraftFilters}
                        onApply={journal.applyFilters}
                        onReset={journal.resetFilters}
                    />

                    <ErrorJournalTable
                        items={journal.items}
                        selectedId={journal.selectedId}
                        onSelect={(id) => void journal.selectItem(id)}
                    />

                    <S.Pagination>
                        <span>{journal.totalItems} записей · page {journal.page + 1} / {Math.max(1, journal.totalPages)}</span>
                        <S.PagerButton
                            type="button"
                            disabled={journal.page <= 0}
                            onClick={() => journal.setPage(journal.page - 1)}
                        >
                            Назад
                        </S.PagerButton>
                        <S.PagerButton
                            type="button"
                            disabled={journal.page + 1 >= journal.totalPages}
                            onClick={() => journal.setPage(journal.page + 1)}
                        >
                            Далее
                        </S.PagerButton>
                    </S.Pagination>
                </S.MainColumn>

                <ErrorJournalDetailDrawer
                    detail={journal.selected}
                    isLoading={journal.isDetailLoading}
                    isSaving={journal.isSavingStatus}
                    error={journal.detailError}
                    onClose={journal.closeDetail}
                    onSaveStatus={(status, note) => void journal.saveStatus(status, note)}
                />
            </S.WorkArea>
        </>
    );
}

export default AdminErrorJournalPageContainer;
