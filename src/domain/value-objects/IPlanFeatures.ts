export interface IPlanFeature {
    id: string;
    planId: string;
    featureCode: string;
    limitValue: number | null;
    isEnabled: boolean | null;
    isResettable: boolean;
}