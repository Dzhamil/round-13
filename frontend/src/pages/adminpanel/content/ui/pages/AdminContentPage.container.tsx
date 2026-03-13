import { Link, useNavigate } from "react-router-dom";
import ErrorText from "../../../../../shared/ui/ErrorText";
import Loader from "../../../../../shared/ui/Loader/Loader";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";
import PanelLogoutButton from "../../../shared/ui/components/PanelLogoutButton/PanelLogoutButton";
import { PanelNavigation } from "../../../shared/ui/components/PanelNavigation/PanelNavigation";
import { usePanelContent } from "../../model/usePanelContent";
import { adminContentPageStyles as styles } from "../styles/AdminContentPage.styles";
import { InfoPageEditor } from "../components/InfoPageEditor";
import { NewsEditor } from "../components/NewsEditor";

export function AdminContentPageContainer() {
    const navigate = useNavigate();
    const {
        pages,
        news,
        newsForm,
        isLoading,
        loadError,
        pageSavingCode,
        pageError,
        pageSuccess,
        newsError,
        newsSuccess,
        isNewsSaving,
        isNewsDeleting,
        updatePageField,
        savePage,
        selectNews,
        startCreateNews,
        updateNewsField,
        saveNews,
        removeNews,
    } = usePanelContent();

    function handleLogout(): void {
        clearPanelAccessToken();
        navigate("/admin/login", { replace: true });
    }

    if (isLoading) {
        return <Loader text="Загружаем контент клуба..." />;
    }

    return (
        <div style={styles.root}>
            <PanelNavigation active="content" />

            <div style={styles.header}>
                <h1 style={styles.title}>Контент клуба</h1>
                <p style={styles.subtitle}>
                    Здесь собраны новости главной страницы и информационные тексты клуба. Контент
                    обновляется без пересечения с магазинами, пакетами и тренировками.
                </p>
            </div>

            <PanelLogoutButton onClick={handleLogout} />

            <div style={styles.note}>
                Для вкладки «Контакты» используйте формат блоков через пустую строку:
                <br />
                `Название`
                <br />
                `Значение`
                <br />
                `Пояснение`
                <br />
                <br />
                Правила клуба редактируются отдельно: <Link to="/admin/rules">открыть правила</Link>
            </div>

            {loadError && <ErrorText message={loadError} />}
            {pageError && <ErrorText message={pageError} />}
            {pageSuccess && <div style={styles.state}>{pageSuccess}</div>}
            {newsError && <ErrorText message={newsError} />}
            {newsSuccess && <div style={styles.state}>{newsSuccess}</div>}

            <div style={styles.grid}>
                <InfoPageEditor
                    code="about"
                    page={pages.about}
                    description="Основной текст вкладки «О клубе». Отделяйте абзацы пустой строкой."
                    hint="Этот текст читается публичной страницей /about."
                    isSaving={pageSavingCode === "about"}
                    onChange={updatePageField}
                    onSave={savePage}
                />

                <InfoPageEditor
                    code="contacts"
                    page={pages.contacts}
                    description="Контакты, телефон, адрес и пояснения для публичной вкладки «Контакты»."
                    hint="Каждый контактный блок оформляйте отдельным абзацем: название, строка значения и пояснение."
                    isSaving={pageSavingCode === "contacts"}
                    onChange={updatePageField}
                    onSave={savePage}
                />

                <InfoPageEditor
                    code="newcomers"
                    page={pages.newcomers}
                    description="Памятка для тех, кто приходит в клуб впервые. Пишите простым текстом, абзацы разделяйте пустой строкой."
                    hint="Этот текст читается публичной вкладкой /about/newcomers."
                    isSaving={pageSavingCode === "newcomers"}
                    onChange={updatePageField}
                    onSave={savePage}
                />

                <NewsEditor
                    news={news}
                    form={newsForm}
                    isSaving={isNewsSaving}
                    isDeleting={isNewsDeleting}
                    onSelect={selectNews}
                    onCreate={startCreateNews}
                    onChange={updateNewsField}
                    onSave={saveNews}
                    onDelete={removeNews}
                />
            </div>
        </div>
    );
}

export default AdminContentPageContainer;
