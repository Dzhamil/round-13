export type HomeNewsItem = {
    id: string;
    title: string;
    excerpt: string;
    publishedAt: string;
};

export type HomeAnnouncementItem = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
};
