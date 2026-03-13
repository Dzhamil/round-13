import { Link } from "react-router-dom";
import styles from "../AboutPage.module.css";
import type { AboutEditablePageCode } from "../model/about.types";

type AboutPageActionsProps = {
    editablePageCode: AboutEditablePageCode | null;
    isEditing: boolean;
    onToggleEditing: () => void;
};

export function AboutPageActions(props: AboutPageActionsProps) {
    const { editablePageCode, isEditing, onToggleEditing } = props;

    if (editablePageCode) {
        return (
            <div className={styles.pageActions}>
                <button type="button" className={styles.editButton} onClick={onToggleEditing}>
                    {isEditing ? "Скрыть редактор" : "Редактировать"}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.pageActions}>
            <Link className={styles.secondaryButtonLink} to="/admin/rules">
                Редактировать правила
            </Link>
        </div>
    );
}
