import { useNavigate } from "react-router-dom";
import ErrorText from "../../../../../shared/ui/ErrorText";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";
import PanelAdminNav from "../../../shared/ui/components/PanelAdminNav/PanelAdminNav";
import PanelLogoutButton from "../../../shared/ui/components/PanelLogoutButton/PanelLogoutButton";
import { usePanelErrorJournal } from "../../model/usePanelErrorJournal";
import { ErrorJournalDetailDrawer } from "../components/ErrorJournalDetailDrawer";
import { ErrorJournalFilters } from "../components/ErrorJournalFilters";
import { ErrorJournalTable } from "../components/ErrorJournalTable";
import * as S from "../styles/AdminErrorJournalPage.styles";

export function AdminErrorJournalPageContainer() {
    const navigate = useNavigate();
    const journal = usePanelErrorJournal();

    function handleLogout(): void {
        clearPanelAccessToken();
        navigate("/admin/login", { replace: true });
    }

    return (
        <S.PageRoot>
            <S.Panel>
                <S.Header>
                    <S.HeadingGroup>
                        <S.Title>Журнал ошибок</S.Title>
                        <PanelAdminNav />
                    </S.HeadingGroup>

                    <S.HeaderActions>
                        {journal.isLoading && <S.Loading>Загрузка…</S.Loading>}
                        <PanelLogoutButton onClick={handleLogout} />
                    </S.HeaderActions>
                </S.Header>

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
            </S.Panel>
        </S.PageRoot>
    );
}

export default AdminErrorJournalPageContainer;
