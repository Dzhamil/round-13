import type { InfoPageResponse } from "../about/model/about.types";
import type { HomeIntroData } from "./model/homeIntro.types";

const DEFAULT_TITLE = "Round13";

export function extractHomeLead(page: InfoPageResponse | null): string | null {
    const content = page?.content?.trim();
    if (!content) {
        return null;
    }

    const firstParagraph = content
        .split(/\n\s*\n/g)
        .map((part) => part.trim())
        .find(Boolean);

    if (!firstParagraph) {
        return null;
    }

    if (firstParagraph.length <= 150) {
        return firstParagraph;
    }

    return `${firstParagraph.slice(0, 147).trimEnd()}...`;
}

export function buildHomeIntroData(params: {
    page: InfoPageResponse | null;
    membersCount: number | null;
}): HomeIntroData {
    const { page, membersCount } = params;

    return {
        title: page?.title?.trim() || DEFAULT_TITLE,
        lead: extractHomeLead(page),
        membersCount,
    };
}
