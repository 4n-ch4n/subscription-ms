export interface ISubscriptionUsage {
    id: string;
    subscriptionId: string;
    featureCode: string | null;
    currentUsage: number | null;
    isActive: boolean | null;
    lastResetAt: Date | string | null;
    periodStart: Date | string | null;
    periodEnd: Date | string | null;
}