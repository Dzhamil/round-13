import React from "react";
import { appStyles } from "../../app/app.styles";
import { SoundToggleButton } from "../ui/SoundToggleButton";

type Props = {
    title: string;
    children: React.ReactNode;
};

export default function AppShell({ title, children }: Props) {
    return (
        <div style={{ ...appStyles.page, position: "relative" }}>
            <SoundToggleButton />
            <h1 style={appStyles.title}>{title}</h1>
            {children}
        </div>
    );
}
