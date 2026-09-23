import type { AttendanceSheetSyncStatus } from "./schedule2.api";
import styles from "./Schedule2Page.module.css";

const labels: Record<AttendanceSheetSyncStatus, string> = {
    NEW: "Ожидает отметки",
    SYNCED: "Передано в таблицу",
    NOT_SYNCED: "Сохранено в приложении, но не передано в Google Sheets",
};

export function AttendanceDeliveryStatus({ status = "NEW" }: { status: AttendanceSheetSyncStatus }) {
    const color = status === "SYNCED" ? styles.deliverySynced
        : status === "NOT_SYNCED" ? styles.deliveryPending : styles.deliveryNew;
    return <span role="status" className={`${styles.deliveryStatus} ${color}`}>{labels[status]}</span>;
}
