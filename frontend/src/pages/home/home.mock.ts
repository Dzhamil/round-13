export type NewsItem = {
    id: string;
    title: string;
    text: string;
    date: string;
};

export const mockNews: NewsItem[] = [
    {
        id: "n1",
        title: "Общие новости клуба",
        text: "Скоро добавим сюда реальные новости из админки. Пока — заглушка для верстки.",
        date: "Сегодня",
    },
];
