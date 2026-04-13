import { Subscription } from '@domain/entities';
import { ISubscriptionUsage } from '@domain/value-objects';
import {
  ISubscriptionModel,
  ISubscriptionUsageModel,
} from '@infrastructure/models';
import { ISubscriptionDTO } from '@application/DTOs';

export class SubscriptionMapper {
  public static mapSubscriptionDTOToEntity = (
    subscriptionDTO: ISubscriptionDTO,
  ): Subscription => {
    const id = subscriptionDTO.id || crypto.randomUUID();

    const subscription = new Subscription({
      id: id,
      companyId: subscriptionDTO.companyId,
      planId: subscriptionDTO.planId || null,
      billingCycle: subscriptionDTO.billingCycle || null,
    });

    return subscription;
  };

  public static mapSubscriptionModelToEntity = (
    rows: (ISubscriptionModel & ISubscriptionUsageModel)[],
  ): Subscription[] => {
    if (!rows.length) return [];

    const subscriptionsMap = new Map<string, Subscription>();
    const usageMap = new Map<string, Map<string, ISubscriptionUsage>>();

    for (const row of rows) {
      const subscriptionId = row.id;

      let subscription = subscriptionsMap.get(subscriptionId);
      if (!subscription) {
        subscription = new Subscription({
          id: row.id,
          planId: row.plan_id,
          companyId: row.company_id,
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          nextBillingDate: row.next_billing_date,
          billingCycle: row.billing_cycle,
          autoRenew: row.auto_renew,
          cancelReason: row.cancel_reason,
          canceledAt: row.canceled_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });

        subscription.usages = [];
        subscriptionsMap.set(subscriptionId, subscription);
        usageMap.set(subscriptionId, new Map());
      }

      if (row.usage_id) {
        const usage = usageMap.get(subscriptionId)!;
        if (!usage.has(row.usage_id)) {
          const subscriptionUsage: ISubscriptionUsage = {
            id: row.usage_id,
            subscriptionId: row.subscription_id,
            featureCode: row.feature_code || '',
            currentUsage: row.current_usage || 0,
            isActive: row.is_active || false,
            lastResetAt: row.last_reset_at,
            periodStart: row.period_start,
            periodEnd: row.period_end,
          };

          usage.set(row.usage_id, subscriptionUsage);
        }
      }
    }

    for (const [subscriptionId, subscription] of subscriptionsMap) {
      subscription.usages = Array.from(
        usageMap.get(subscriptionId)?.values() ?? [],
      );
    }

    return Array.from(subscriptionsMap.values());
  };

  public static mapSubscriptionEntityToModel = (
    subscription: Subscription,
  ): ISubscriptionModel => {
    return {
      id: subscription.id,
      plan_id: subscription.planId,
      company_id: subscription.companyId,
      status: subscription.status,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      next_billing_date: subscription.nextBillingDate,
      billing_cycle: subscription.billingCycle,
      auto_renew: subscription.autoRenew,
      cancel_reason: subscription.cancelReason,
      canceled_at: subscription.canceledAt,
      created_at: subscription.createdAt,
      updated_at: subscription.updatedAt,
    };
  };
}
