import styles from "../AboutPage.module.css";

type AboutHeroProps = {
    title: string;
    updatedAt: string | null;
};

export function AboutHero(props: AboutHeroProps) {
    const { title, updatedAt } = props;

    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <div className={styles.heroCopy}>
                    <h2 className={styles.title}>{title}</h2>
                    {updatedAt && <p className={styles.heroLead}>Обновлено: {updatedAt}</p>}
                </div>
            </div>
        </section>
    );
}
