import { useEffect, useState } from "react";
import { homeIntroApi } from "../api/homeIntro.api";
import { buildHomeIntroData } from "../homeIntro.helpers";
import type { HomeIntroData } from "./homeIntro.types";

type UseHomeIntroResult = {
    intro: HomeIntroData;
};

const DEFAULT_INTRO: HomeIntroData = {
    title: "Round13",
    lead: null,
    membersCount: null,
};

export function useHomeIntro(): UseHomeIntroResult {
    const [intro, setIntro] = useState<HomeIntroData>(DEFAULT_INTRO);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const [aboutResult, membersCountResult] = await Promise.allSettled([
                homeIntroApi.getAboutPage(),
                homeIntroApi.getMembersCount(),
            ]);

            if (cancelled) {
                return;
            }

            setIntro(buildHomeIntroData({
                page: aboutResult.status === "fulfilled" ? aboutResult.value : null,
                membersCount: membersCountResult.status === "fulfilled" ? membersCountResult.value : null,
            }));
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { intro };
}
