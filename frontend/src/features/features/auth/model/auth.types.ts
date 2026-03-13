export type AuthStep = "PHONE" | "CODE";

export type AuthFlowState = {
    step: AuthStep;
    phone: string;
    code: string;
    isLoading: boolean;
    error: string | null;
};

export type AuthFlowActions = {
    setPhone: (value: string) => void;
    setCode: (value: string) => void;

    sendCode: () => Promise<void>;
    verifyAndLogin: () => Promise<void>;
    backToPhone: () => void;
};

export type AuthFlow = AuthFlowState & AuthFlowActions;
