// frontend/src/app/AppShell.tsx
import { PropsWithChildren, useEffect } from "react";

import { AppHeader } from "../shared/ui/AppHeader/AppHeader";
import { appShellStyles as s } from "./appShell.styles";

import { armAutoStartOnFirstGesture, playBackground } from "../shared/lib/menuAudio";
import { useGlobalClickSound } from "../shared/lib/clickSound/useGlobalClickSound";
import { useSwipeBackNavigation } from "../shared/lib/useSwipeBackNavigation";

export type AppShellContentVariant = "default" | "fullBleed";
export type AppShellAppearance = "default" | "home";

type AppShellProps = PropsWithChildren<{
    title?: string;
    contentVariant?: AppShellContentVariant;
    appearance?: AppShellAppearance;
}>;

export function AppShell({ title, contentVariant = "default", appearance = "default", children }: AppShellProps) {
    useGlobalClickSound();
    useSwipeBackNavigation();

    useEffect(() => {
        armAutoStartOnFirstGesture();
        playBackground();
    }, []);

    const contentStyle =
        contentVariant === "fullBleed" ? s.contentFullBleed : s.content;
    const rootStyle = appearance === "home" ? s.rootHome : s.root;

    return (
        <div style={rootStyle}>
            <AppHeader title={title} appearance={appearance} />
            <main style={contentStyle}>{children}</main>
        </div>
    );
}
