// frontend/src/app/AppShell.tsx
import { PropsWithChildren, useEffect } from "react";

import { AppHeader } from "../shared/ui/AppHeader/AppHeader";
import { appShellStyles as s } from "./appShell.styles";

import { armAutoStartOnFirstGesture, playBackground } from "../shared/lib/menuAudio";
import { useGlobalClickSound } from "../shared/lib/clickSound/useGlobalClickSound";
import { useSwipeBackNavigation } from "../shared/lib/useSwipeBackNavigation";

export type AppShellContentVariant = "default" | "fullBleed";

type AppShellProps = PropsWithChildren<{
    title?: string;
    contentVariant?: AppShellContentVariant;
}>;

export function AppShell({ title, contentVariant = "default", children }: AppShellProps) {
    useGlobalClickSound();
    useSwipeBackNavigation();

    useEffect(() => {
        armAutoStartOnFirstGesture();
        playBackground();
    }, []);

    const contentStyle =
        contentVariant === "fullBleed" ? s.contentFullBleed : s.content;

    return (
        <div style={s.root}>
            <AppHeader title={title} />
            <main style={contentStyle}>{children}</main>
        </div>
    );
}
