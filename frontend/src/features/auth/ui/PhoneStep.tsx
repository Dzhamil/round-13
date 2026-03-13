import React from "react";
import Button from "../../../shared/ui/Button";
import Field from "../../../shared/ui/Field";
import Input from "../../../shared/ui/Input";

type Props = {
    phone: string;
    isLoading: boolean;
    onPhoneChange: (value: string) => void;
    onSendCode: () => void;
};

export default function PhoneStep({
                                      phone,
                                      isLoading,
                                      onPhoneChange,
                                      onSendCode
                                  }: Props) {
    return (
        <>
            <Field label="Телефон">
                <Input
                    value={phone}
                    onChange={onPhoneChange}
                    placeholder="+7 900 000-00-00"
                    inputMode="tel"
                    autoComplete="tel"
                    disabled={isLoading}
                />
            </Field>

            <Button onClick={onSendCode} disabled={isLoading} variant="primary">
                {isLoading ? "Отправляем..." : "Получить код"}
            </Button>
        </>
    );
}
