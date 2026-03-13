import React from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;

    placeholder?: string;
    disabled?: boolean;

    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    autoComplete?: string;
};

export default function Input({
                                  value,
                                  onChange,
                                  placeholder,
                                  disabled = false,
                                  inputMode,
                                  autoComplete
                              }: Props) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={autoComplete}
            style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.15)"
            }}
        />
    );
}
