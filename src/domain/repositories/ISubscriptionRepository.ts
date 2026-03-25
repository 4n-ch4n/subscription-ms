import { Subscription } from '@domain/entities';
import { ISubscriptionUsage } from '@domain/value-objects';
import { PoolClient } from 'pg';

export interface ISubscriptionRepository {
    getSubscriptionById(id: string): Promise<Subscription | null>;
    getSubscriptionsByCompanyId(companyId: string): Promise<Subscription[]>;
    getActiveSubscription(companyId: string): Promise<Subscription | null>;
    createSubscription(
        subscription: Subscription,
        connection?: PoolClient,
    ): Promise<void>;
    createSubscriptionUsages(
        usages: ISubscriptionUsage[],
        connection?: PoolClient,
    ): Promise<void>;
    updateSubscription(
        subscription: Subscription,
        connection?: PoolClient,
    ): Promise<void>;
    updateSubscriptionUsage(
        usage: ISubscriptionUsage,
        connection?: PoolClient,
    ): Promise<void>;
    incrementUsage(
        companyId: string,
        count: number,
        code: string,
        connection?: PoolClient,
    ): Promise<void>;
    decrementUsage(
        companyId: string,
        count: number,
        code: string,
        connection?: PoolClient,
    ): Promise<void>;
}
