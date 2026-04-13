import { ISubscriptionUsage, SubscriptionStatus } from "@domain/value-objects";

export class Subscription {
    public usages: ISubscriptionUsage[] = [];

    public id: string;
    public companyId: string;
    public planId: string | null;
    public status: SubscriptionStatus | null;
    public startDate: Date | string | null;
    public endDate: Date | string | null
    public nextBillingDate: Date | string | null;
    public billingCycle: 'MONTHLY' | 'ANNUAL' | null;
    public autoRenew: boolean | null;
    public cancelReason: string | null;
    public canceledAt: Date | string | null;
    public createdAt: Date | string | null;
    public updatedAt: Date | string | null;

    constructor({
        id,
        companyId,
        planId = null,
        status = null,
        startDate = null,
        endDate = null,
        nextBillingDate = null,
        billingCycle = null,
        autoRenew = null,
        cancelReason = null,
        canceledAt = null,
        createdAt = null,
        updatedAt = null,
    }: {
        id: string;
        companyId: string;
        planId?: string | null;
        status?: SubscriptionStatus | null;
        startDate?: Date | string | null;
        endDate?: Date | string | null;
        nextBillingDate?: Date | string | null;
        billingCycle?: 'MONTHLY' | 'ANNUAL' | null;
        autoRenew?: boolean | null;
        cancelReason?: string | null;
        canceledAt?: Date | string | null;
        createdAt?: Date | string | null;
        updatedAt?: Date | string | null;
    }) {
        this.id = id;
        this.companyId = companyId;
        this.planId = planId;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.nextBillingDate = nextBillingDate;
        this.billingCycle = billingCycle;
        this.autoRenew = autoRenew;
        this.cancelReason = cancelReason;
        this.canceledAt = canceledAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}