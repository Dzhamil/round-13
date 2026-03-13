import { homePageStyles as s } from "./homePage.styles";

export type NewsCardProps = {
    title: string;
    text: string;
    date: string;
};

export function NewsCard({ title, text, date }: NewsCardProps) {
    return (
        <article style={s.card}>
            <div style={s.cardTop}>
                <div style={s.cardTitle}>{title}</div>
                <div style={s.cardDate}>{date}</div>
            </div>

            <div style={s.cardText}>{text}</div>
        </article>
    );
}
