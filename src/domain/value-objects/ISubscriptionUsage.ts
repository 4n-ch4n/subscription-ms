export interface ISubscriptionUsage {
    id: string;
    subscriptionId: string;
    featureCode: string;
    currentUsage: number;
    isActive: boolean;
    lastResetAt: Date | string | null;
    periodStart: Date | string | null;
    periodEnd: Date | string | null;
}