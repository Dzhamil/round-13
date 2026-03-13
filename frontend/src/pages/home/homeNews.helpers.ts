export function formatHomeNewsDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Без даты";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
    }).format(date);
}
