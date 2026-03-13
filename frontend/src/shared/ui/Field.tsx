import React from "react";

type Props = {
    label: string;
    children: React.ReactNode;
    hint?: string;
};

export default function Field({ label, children, hint }: Props) {
    return (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6 }}>{label}</label>
            {children}
            {hint ? (
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>{hint}</div>
            ) : null}
        </div>
    );
}
