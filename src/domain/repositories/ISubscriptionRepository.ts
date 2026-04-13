import { PoolClient } from 'pg';
import { Subscription } from '@domain/entities';
import { ISubscriptionUsage, PaginatedResult, PaginationQuery } from '@domain/value-objects';

export interface ISubscriptionRepository {
  getSubscriptionById(id: string): Promise<Subscription | null>;
  getSubscriptionsByCompanyId(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Subscription>>;
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
    subscriptionId: string,
    count: number,
    code: string,
    connection?: PoolClient,
  ): Promise<void>;
  decrementUsage(
    subscriptionId: string,
    count: number,
    code: string,
    connection?: PoolClient,
  ): Promise<void>;
  cancelAllCompanySubscriptions(
    companyId: string,
    connection?: PoolClient,
  ): Promise<void>;
}
