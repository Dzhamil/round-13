import React from "react";
import Button from "../../../shared/ui/Button";
import Field from "../../../shared/ui/Field";
import Input from "../../../shared/ui/Input";

type Props = {
    phone: string;
    code: string;
    isLoading: boolean;

    onCodeChange: (value: string) => void;
    onVerify: () => void;
    onBack: () => void;
};

export default function CodeStep({
                                     phone,
                                     code,
                                     isLoading,
                                     onCodeChange,
                                     onVerify,
                                     onBack
                                 }: Props) {
    return (
        <>
            <div style={{ marginBottom: 12, fontSize: 14 }}>
                Код отправлен на <b>{phone}</b>
            </div>

            <Field label="Код из SMS">
                <Input
                    value={code}
                    onChange={onCodeChange}
                    placeholder="1234"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={isLoading}
                />
            </Field>

            <div style={{ marginBottom: 10 }}>
                <Button onClick={onVerify} disabled={isLoading} variant="primary">
                    {isLoading ? "Проверяем..." : "Подтвердить"}
                </Button>
            </div>

            <Button onClick={onBack} disabled={isLoading} variant="secondary">
                Назад
            </Button>
        </>
    );
}
