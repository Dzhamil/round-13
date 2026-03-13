import styles from "./HomeIntro.module.css";
import type { HomeIntroData } from "../model/homeIntro.types";

type HomeIntroProps = {
    intro: HomeIntroData;
};

export function HomeIntro(props: HomeIntroProps) {
    const { intro } = props;

    return (
        <section className={styles.block} aria-label="О клубе">
            {intro.membersCount !== null && (
                <p className={styles.badge}>Нас уже {intro.membersCount}</p>
            )}
            <h1 className={styles.title}>{intro.title}</h1>
            {intro.lead && <p className={styles.lead}>{intro.lead}</p>}
        </section>
    );
}
