import styles from "../AboutPage.module.css";

type AboutHeroProps = {
    title: string;
};

export function AboutHero(props: AboutHeroProps) {
    const { title } = props;

    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <div className={styles.heroCopy}>
                    <h2 className={styles.title}>{title}</h2>
                </div>
            </div>
        </section>
    );
}
