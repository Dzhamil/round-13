import { useCallback, useRef, useState } from "react";

import { createShopOrder } from "../api/order.api";
import { DEFAULT_SHOP_ORDER_QUANTITY } from "./shop.constants";
import { extractShopErrorMessage } from "./shopError";

type CreateShopOrderRequestState = {
    submitting: boolean;
    actionError: string | null;
    createdOrderId: string | null;
    createOrder: (productId: string) => Promise<string | null>;
    resetOrderState: () => void;
};

export function useCreateShopOrderRequest(): CreateShopOrderRequestState {
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const submittingRef = useRef(false);
    const requestSeq = useRef(0);

    const resetOrderState = useCallback(() => {
        requestSeq.current += 1;
        submittingRef.current = false;
        setSubmitting(false);
        setActionError(null);
        setCreatedOrderId(null);
    }, []);

    const createOrder = useCallback(async (productId: string) => {
        if (submittingRef.current) return null;

        const seq = requestSeq.current + 1;
        requestSeq.current = seq;
        submittingRef.current = true;
        setSubmitting(true);
        setActionError(null);
        setCreatedOrderId(null);

        try {
            const orderId = await createShopOrder({
                items: [{ productId, quantity: DEFAULT_SHOP_ORDER_QUANTITY }],
            });

            if (requestSeq.current !== seq) return null;
            setCreatedOrderId(orderId);
            return orderId;
        } catch (err: unknown) {
            if (requestSeq.current === seq) {
                setActionError(extractShopErrorMessage(err, "Не удалось оформить покупку."));
            }
            return null;
        } finally {
            if (requestSeq.current === seq) {
                submittingRef.current = false;
                setSubmitting(false);
            }
        }
    }, []);

    return {
        submitting,
        actionError,
        createdOrderId,
        createOrder,
        resetOrderState,
    };
}
