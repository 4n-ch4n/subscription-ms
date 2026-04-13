import { add, format } from 'date-fns';
import { Invoice, Subscription } from '@domain/entities';
import {
    IInvoiceRepository,
    IPlanRepository,
    ISubscriptionRepository,
} from '@domain/repositories';
import { ISubscriptionUsage, PaginatedResult, PaginationQuery } from '@domain/value-objects';
import {
    ApiErrorResponse,
    ErrorCode,
    StatusCode,
} from '@config/schemas/response';
import { TransactionManager } from '@config';

export class SubscriptionService {
    constructor(
        private planRepository: IPlanRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private invoiceRepository: IInvoiceRepository,
        private transactionManager: TransactionManager,
    ) { }

    async getSubscriptionById(id: string): Promise<Subscription | null> {
        const subscription =
            await this.subscriptionRepository.getSubscriptionById(id);
        return subscription;
    }

    async getSubscriptionsByCompanyId(
        companyId: string,
        pagination: PaginationQuery,
    ): Promise<PaginatedResult<Subscription>> {
        const subscriptions =
            await this.subscriptionRepository.getSubscriptionsByCompanyId(companyId, pagination);
        return subscriptions;
    }

    async getActiveSubscription(companyId: string): Promise<Subscription | null> {
        const activeSubscription =
            await this.subscriptionRepository.getActiveSubscription(companyId);
        return activeSubscription;
    }

    async createSubscription(
        companyId: string,
        planId: string,
        billingCycle: 'MONTHLY' | 'ANNUAL',
    ): Promise<Subscription> {
        const existingSubscription = await this.getActiveSubscription(companyId);
        if (existingSubscription) {
            throw new ApiErrorResponse(
                StatusCode.BAD_REQUEST,
                ErrorCode.SUBSCRIPTION_ALREADY_EXISTS,
                'An active subscription already exists for this company',
            );
        }

        const plan = await this.planRepository.getPlanById(planId);
        if (!plan) {
            throw new ApiErrorResponse(
                StatusCode.NOT_FOUND,
                ErrorCode.NOT_FOUND,
                'Plan not found',
            );
        }

        return this.transactionManager.executeInTransaction(async (conn) => {
            const currentDate = new Date();
            const isAnnual = billingCycle === 'ANNUAL';
            const periodStart = format(currentDate, 'yyyy-MM-dd');
            const periodEnd = format(
                add(
                    currentDate,
                    isAnnual
                        ? { years: 1 }
                        : plan.name === 'Free'
                            ? { days: 7 }
                            : { months: 1 },
                ),
                'yyyy-MM-dd',
            );

            const subscription = new Subscription({
                id: crypto.randomUUID(),
                planId: plan.id,
                companyId: companyId,
                status: plan.name === 'Free' ? 'ACTIVE' : 'TRIALING',
                startDate: periodStart,
                nextBillingDate: periodEnd,
                billingCycle: billingCycle,
                autoRenew: true,
                createdAt: currentDate,
            });

            subscription.usages = plan.features.map((feature) => ({
                id: crypto.randomUUID(),
                subscriptionId: subscription.id,
                featureCode: feature.featureCode,
                currentUsage: 0,
                isActive: true,
                lastResetAt: currentDate,
                periodStart: periodStart,
                periodEnd: periodEnd,
            }));

            const basePrice = isAnnual ? (plan.price ?? 0) * 12 : (plan.price ?? 0);
            if (basePrice > 0) {
                const taxAmount = basePrice * 0.1;
                const totalPrice = basePrice + taxAmount;

                const invoice = new Invoice({
                    id: crypto.randomUUID(),
                    subscriptionId: subscription.id,
                    companyId: companyId,
                    invoiceNumber: `INV-${Date.now()}`,
                    amount: totalPrice,
                    currency: 'USD',
                    status: 'PAID',
                    billingPeriodStart: periodStart,
                    billingPeriodEnd: periodEnd,
                    dueDate: periodEnd,
                    paidAt: currentDate,
                    createdAt: currentDate,
                });

                await this.invoiceRepository.createInvoice(invoice, conn);
            }

            await this.subscriptionRepository.createSubscription(subscription, conn);
            await this.subscriptionRepository.createSubscriptionUsages(
                subscription.usages,
                conn,
            );

            return subscription;
        });
    }

    async cancelSubscription(
        subscriptionId: string,
        companyId: string,
    ): Promise<Subscription> {
        const subscription = await this.getSubscriptionById(subscriptionId);

        if (!subscription || subscription.companyId !== companyId) {
            throw new ApiErrorResponse(
                StatusCode.NOT_FOUND,
                ErrorCode.NOT_FOUND,
                'Subscription not found',
            );
        }

        if (subscription.status === 'CANCELLED') {
            throw new ApiErrorResponse(
                StatusCode.BAD_REQUEST,
                ErrorCode.FAILURE,
                'Subscription is already canceled',
            );
        }

        subscription.autoRenew = false;
        subscription.updatedAt = new Date();

        await this.subscriptionRepository.updateSubscription(subscription);

        return subscription;
    }

    async changePlan(
        companyId: string,
        newPlanId: string,
        newBillingCycle: 'MONTHLY' | 'ANNUAL',
    ): Promise<Subscription> {
        const currentSubscription = await this.getActiveSubscription(companyId);
        
        if (!currentSubscription) {
            throw new ApiErrorResponse(
                StatusCode.NOT_FOUND,
                ErrorCode.NOT_FOUND,
                'No active subscription found to change',
            );
        }

        if (currentSubscription.planId === newPlanId && currentSubscription.billingCycle === newBillingCycle) {
            throw new ApiErrorResponse(
                StatusCode.BAD_REQUEST,
                ErrorCode.FAILURE,
                'Already subscribed to the requested plan and billing cycle',
            );
        }

        const newPlan = await this.planRepository.getPlanById(newPlanId);
        if (!newPlan) {
            throw new ApiErrorResponse(
                StatusCode.NOT_FOUND,
                ErrorCode.NOT_FOUND,
                'New plan not found',
            );
        }

        return this.transactionManager.executeInTransaction(async (conn) => {
            const currentDate = new Date();

            currentSubscription.status = 'CANCELLED';
            currentSubscription.autoRenew = false;
            currentSubscription.canceledAt = currentDate;
            currentSubscription.updatedAt = currentDate;
            
            await this.subscriptionRepository.updateSubscription(currentSubscription, conn);

            const isAnnual = newBillingCycle === 'ANNUAL';
            const periodStart = format(currentDate, 'yyyy-MM-dd');
            const periodEnd = format(
                add(
                    currentDate,
                    isAnnual
                        ? { years: 1 }
                        : newPlan.name === 'Free'
                            ? { days: 7 }
                            : { months: 1 },
                ),
                'yyyy-MM-dd',
            );

            const newSubscription = new Subscription({
                id: crypto.randomUUID(),
                planId: newPlan.id,
                companyId: companyId,
                status: 'ACTIVE',
                startDate: periodStart,
                nextBillingDate: periodEnd,
                billingCycle: newBillingCycle,
                autoRenew: true,
                createdAt: currentDate,
            });

            newSubscription.usages = newPlan.features.map((feature) => ({
                id: crypto.randomUUID(),
                subscriptionId: newSubscription.id,
                featureCode: feature.featureCode,
                currentUsage: 0,
                isActive: true,
                lastResetAt: currentDate,
                periodStart: periodStart,
                periodEnd: periodEnd,
            }));

            const basePrice = isAnnual ? (newPlan.price ?? 0) * 12 : (newPlan.price ?? 0);
            if (basePrice > 0) {
                const taxAmount = basePrice * 0.1;
                const totalPrice = basePrice + taxAmount;

                const invoice = new Invoice({
                    id: crypto.randomUUID(),
                    subscriptionId: newSubscription.id,
                    companyId: companyId,
                    invoiceNumber: `INV-UPG-${Date.now()}`,
                    amount: totalPrice,
                    currency: 'USD',
                    status: 'PAID',
                    billingPeriodStart: periodStart,
                    billingPeriodEnd: periodEnd,
                    dueDate: periodEnd,
                    paidAt: currentDate,
                    createdAt: currentDate,
                });

                await this.invoiceRepository.createInvoice(invoice, conn);
            }

            await this.subscriptionRepository.createSubscription(newSubscription, conn);
            await this.subscriptionRepository.createSubscriptionUsages(
                newSubscription.usages,
                conn,
            );

            return newSubscription;
        });
    }

    async hasAccessToFeature(
        companyId: string,
        featureCode: string,
    ): Promise<boolean> {
        const subscription = await this.getActiveSubscription(companyId);
        if (
            !subscription ||
            !['ACTIVE', 'TRIALING'].includes(subscription.status || '')
        )
            return false;

        const usage = subscription.usages.find(
            (u) => u.featureCode === featureCode,
        );

        if (!usage || !usage.isActive) return false;

        const plan = await this.planRepository.getPlanById(subscription.planId!);
        const feature = plan?.features.find((f) => f.featureCode === featureCode);

        if (!feature) return false;

        if (feature.limitValue === null) return true;

        if (!usage) return false;

        return usage.currentUsage! < feature.limitValue;
    }

    async updateSubscription(subscription: Subscription): Promise<Subscription> {
        subscription.updatedAt = new Date();
        await this.subscriptionRepository.updateSubscription(subscription);
        return subscription;
    }

    async updateSubscriptionUsage(
        usage: ISubscriptionUsage,
    ): Promise<ISubscriptionUsage> {
        await this.subscriptionRepository.updateSubscriptionUsage(usage);
        return usage;
    }

    async incrementFeatureUsed(
        companyId: string,
        count: number,
        featureCode: string,
    ): Promise<void> {
        await this.subscriptionRepository.incrementUsage(
            companyId,
            count,
            featureCode,
        );
    }

    async decrementFeatureUsed(
        companyId: string,
        count: number,
        featureCode: string,
    ): Promise<void> {
        await this.subscriptionRepository.decrementUsage(
            companyId,
            count,
            featureCode,
        );
    }

    async handleCompanyDeletedEvent(companyId: string): Promise<void> {
        await this.subscriptionRepository.cancelAllCompanySubscriptions(companyId);
    }
}
