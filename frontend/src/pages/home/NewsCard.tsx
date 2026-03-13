import styles from "./components/NewsCard.module.css";

export type NewsCardProps = {
    title: string;
    text: string;
    date: string;
};

export function NewsCard({ title, text, date }: NewsCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.date}>{date}</div>
            </div>

            <p className={styles.text}>{text}</p>
        </article>
    );
}
