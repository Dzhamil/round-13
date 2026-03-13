import { Link } from "react-router-dom";
import styles from "../RulesPage.module.css";

type Props = {
    title: string;
    adminHref?: string;
    adminText?: string;
};

export function RulesHeader({ title, adminHref = "/admin/rules", adminText = "Админ" }: Props) {
    return (
        <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <Link className={styles.adminLink} to={adminHref}>
                {adminText}
            </Link>
        </div>
    );
}
