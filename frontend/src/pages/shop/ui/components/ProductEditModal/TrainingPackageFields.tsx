import type { ShopEntitlementType } from "../../../api/product.api";
import type { MemberListItem } from "../../../../members/model/members.types";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";
import { ENTITLEMENT_TYPE_OPTIONS, PRODUCT_EDIT_TEXT } from "./productEditModal.constants";
import { formatCoachOptionLabel } from "./productEditModal.helpers";

type Props = {
    entitlementType: ShopEntitlementType;
    entitlementQuantity: string;
    trainerId: string;
    coaches: MemberListItem[];
    onEntitlementTypeChange: (value: ShopEntitlementType) => void;
    onEntitlementQuantityChange: (value: string) => void;
    onTrainerIdChange: (value: string) => void;
};

export function TrainingPackageFields({
    entitlementType,
    entitlementQuantity,
    trainerId,
    coaches,
    onEntitlementTypeChange,
    onEntitlementQuantityChange,
    onTrainerIdChange,
}: Props) {
    return (
        <>
            <label style={s.modalLabel}>Тип пакета</label>
            <select
                value={entitlementType}
                onChange={(e) => onEntitlementTypeChange(e.target.value as ShopEntitlementType)}
                style={s.modalInput}
            >
                {ENTITLEMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <label style={s.modalLabel}>Количество тренировок</label>
            <input
                value={entitlementQuantity}
                onChange={(e) => onEntitlementQuantityChange(e.target.value)}
                style={s.modalInput}
                inputMode="numeric"
                placeholder={PRODUCT_EDIT_TEXT.quantityPlaceholder}
            />

            {entitlementType === "PERSONAL_TRAININGS" ? (
                <>
                    <label style={s.modalLabel}>{PRODUCT_EDIT_TEXT.personalTrainerLabel}</label>
                    <select
                        value={trainerId}
                        onChange={(e) => onTrainerIdChange(e.target.value)}
                        style={s.modalInput}
                    >
                        <option value="">{PRODUCT_EDIT_TEXT.trainerPlaceholder}</option>
                        {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                                {formatCoachOptionLabel(coach)}
                            </option>
                        ))}
                    </select>
                </>
            ) : null}
        </>
    );
}
