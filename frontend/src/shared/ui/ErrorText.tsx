import React from "react";

type Props = {
    message: string;
};

export default function ErrorText({ message }: Props) {
    return (
        <div style={{ marginTop: 12, fontSize: 13, color: "#b00020" }}>
            {message}
        </div>
    );
}
