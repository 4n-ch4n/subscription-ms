import { PoolClient } from 'pg';
import { Subscription } from '@domain/entities';
import { ISubscriptionRepository } from '@domain/repositories';
import { ISubscriptionUsage } from '@domain/value-objects';
import { IPostgres } from './config';
import { dynamicFieldsToUpdate, QueryBuilder } from '@config/utils';
import {
  ISubscriptionModel,
  ISubscriptionUsageModel,
} from '@infrastructure/models';
import { SubscriptionMapper } from '@config/utils/mappers';

export class SubscriptionRepository implements ISubscriptionRepository {
  private postgresEntity: string = 'subscriptions';

  constructor(private db: IPostgres) {}

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    const query = new QueryBuilder(this.postgresEntity)
      .setColumns(`${this.postgresEntity}.*, su.id AS usage_id, su.*`)
      .addJoin(
        `LEFT JOIN subscription_usages su ON (${this.postgresEntity}.id = su.subscription_id)`,
      )
      .addCondition(`${this.postgresEntity}.id = $1`)
      .build();

    const { rows } = await this.db.postgresDb.query<
      ISubscriptionModel & ISubscriptionUsageModel
    >(query, [id]);

    return SubscriptionMapper.mapSubscriptionModelToEntity(rows)[0] || null;
  }

  async getSubscriptionsByCompanyId(
    companyId: string,
  ): Promise<Subscription[]> {
    const query = new QueryBuilder(this.postgresEntity)
      .setColumns(`${this.postgresEntity}.*, su.id AS usage_id, su.*`)
      .addJoin(
        `LEFT JOIN subscription_usages su ON (${this.postgresEntity}.id = su.subscription_id)`,
      )
      .addCondition(`${this.postgresEntity}.company_id = $1`)
      .build();

    const { rows } = await this.db.postgresDb.query<
      ISubscriptionModel & ISubscriptionUsageModel
    >(query, [companyId]);

    return SubscriptionMapper.mapSubscriptionModelToEntity(rows);
  }

  async getActiveSubscription(companyId: string): Promise<Subscription | null> {
    const query = new QueryBuilder(this.postgresEntity)
      .setColumns(`${this.postgresEntity}.*, su.id AS usage_id, su.*`)
      .addJoin(
        `LEFT JOIN subscription_usages su ON (${this.postgresEntity}.id = su.subscription_id)`,
      )
      .addCondition(`${this.postgresEntity}.company_id = $1 AND`)
      .addCondition(`${this.postgresEntity}.status = 'ACTIVE'`)
      .build();

    const { rows } = await this.db.postgresDb.query<
      ISubscriptionModel & ISubscriptionUsageModel
    >(query, [companyId]);

    return SubscriptionMapper.mapSubscriptionModelToEntity(rows)[0] || null;
  }

  async createSubscription(
    subscription: Subscription,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const subscriptionToSave =
      SubscriptionMapper.mapSubscriptionEntityToModel(subscription);
    await db.query(
      `INSERT INTO ${this.postgresEntity} 
       (id, plan_id, company_id, status, start_date, end_date, next_billing_date, billing_cycle, auto_renew, cancel_reason, canceled_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        subscriptionToSave.id,
        subscriptionToSave.plan_id,
        subscriptionToSave.company_id,
        subscriptionToSave.status,
        subscriptionToSave.start_date,
        subscriptionToSave.end_date,
        subscriptionToSave.next_billing_date,
        subscriptionToSave.billing_cycle,
        subscriptionToSave.auto_renew,
        subscriptionToSave.cancel_reason,
        subscriptionToSave.canceled_at,
        subscriptionToSave.created_at,
        subscriptionToSave.updated_at,
      ],
    );
  }

  async createSubscriptionUsages(
    usages: ISubscriptionUsage[],
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const values = usages.map(usage => [
        usage.id,
        usage.subscriptionId,
        usage.featureCode,
        usage.currentUsage,
        usage.isActive,
        usage.lastResetAt,
        usage.periodStart,
        usage.periodEnd,
    ]);
    await db.query(
        `INSERT INTO subscription_usages 
        (id, subscription_id, feature_code, current_usage, is_active, last_reset_at, period_start, period_end) 
        VALUES ${values.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')}`,
      values.flat(),
    );
  }

  async updateSubscription(
    subscription: Subscription,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const subscriptionToUpdate =
      SubscriptionMapper.mapSubscriptionEntityToModel(subscription);

    const [fieldToUpdate, valuesToUpdate] = dynamicFieldsToUpdate(
      subscriptionToUpdate,
      'id',
    );
    await db.query(
      `UPDATE ${this.postgresEntity} SET ${fieldToUpdate.join(', ')} WHERE id = $${fieldToUpdate.length + 1}`,
      valuesToUpdate,
    );
  }

  async updateSubscriptionUsage(
    usage: ISubscriptionUsage,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const usageToUpdate = {
      usage_id: usage.id,
      subscription_id: usage.subscriptionId,
      feature_code: usage.featureCode,
      current_usage: usage.currentUsage,
      is_active: usage.isActive,
      last_reset_at: usage.lastResetAt,
      period_start: usage.periodStart,
      period_end: usage.periodEnd,
    };
    const [fieldToUpdate, valuesToUpdate] = dynamicFieldsToUpdate(
      usageToUpdate,
      'id',
    );
    await db.query(
      `UPDATE subscription_usages SET ${fieldToUpdate.join(', ')} WHERE id = $${fieldToUpdate.length + 1}`,
      valuesToUpdate,
    );
  }

  async incrementUsage(
    subscriptionId: string,
    count: number,
    code: string,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    await db.query(
      `UPDATE subscription_usages
       SET current_usage = COALESCE(current_usage, 0) + $1
       WHERE subscription_id = $2 
         AND feature_code = $3`,
      [count, subscriptionId, code],
    );
  }

  async decrementUsage(
    subscriptionId: string,
    count: number,
    code: string,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    await db.query(
      `UPDATE subscription_usages
       SET current_usage = GREATEST(COALESCE(current_usage, 0) - $1, 0)
       WHERE subscription_id = $2 
         AND feature_code = $3`,
      [count, subscriptionId, code],
    );
  }

  async cancelAllCompanySubscriptions(
    companyId: string,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    await db.query(
      `UPDATE ${this.postgresEntity}
       SET status = 'CANCELLED', auto_renew = FALSE, canceled_at = NOW()
       WHERE company_id = $1 AND status IN ('ACTIVE', 'TRIALING')`,
      [companyId],
    );
  }
}
