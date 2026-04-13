import { SubscriptionMapper } from '@config/utils/mappers';
import { Subscription } from '@domain/entities';
import { SubscriptionService } from '@domain/services';
import { ISubscriptionDTO, ISubscriptionUsageDTO } from '@application/DTOs';
import { ISubscriptionUsage, PaginatedResult, PaginationQuery } from '@domain/value-objects';

export class SubscriptionAppService {
  constructor(private subscriptionService: SubscriptionService) {}

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    return subscription;
  }

  async getSubscriptionsByCompanyId(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Subscription>> {
    const subscriptions =
      await this.subscriptionService.getSubscriptionsByCompanyId(companyId, pagination);
    return subscriptions;
  }

  async getActiveSubscription(companyId: string): Promise<Subscription | null> {
    const subscription =
      await this.subscriptionService.getActiveSubscription(companyId);
    return subscription;
  }

  async createSubscription(
    companyId: string,
    planId: string,
    billingCycle: 'MONTHLY' | 'ANNUAL',
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.createSubscription(
      companyId,
      planId,
      billingCycle,
    );
    return subscription;
  }

  async cancelSubscription(
    subscriptionId: string,
    companyId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.cancelSubscription(
      subscriptionId,
      companyId,
    );
    return subscription;
  }

  async changeSubscriptionPlan(
    companyId: string,
    newPlanId: string,
    newBillingCycle: 'MONTHLY' | 'ANNUAL',
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.changePlan(
      companyId,
      newPlanId,
      newBillingCycle,
    );
    return subscription;
  }

  async hasAccessToFeature(
    companyId: string,
    featureCode: string,
  ): Promise<boolean> {
    const hasAccess = await this.subscriptionService.hasAccessToFeature(
      companyId,
      featureCode,
    );
    return hasAccess;
  }

  async updateSubscription(
    subscriptionDTO: ISubscriptionDTO,
  ): Promise<Subscription> {
    const subscriptionToUpdate =
      SubscriptionMapper.mapSubscriptionDTOToEntity(subscriptionDTO);
    const subscription =
      await this.subscriptionService.updateSubscription(subscriptionToUpdate);
    return subscription;
  }

  async updateSubscriptionUsage(
    subscriptionUsageDTO: ISubscriptionUsageDTO,
  ): Promise<ISubscriptionUsage> {
    const usageToUpdate: ISubscriptionUsage = {
      id: subscriptionUsageDTO.id,
      subscriptionId: subscriptionUsageDTO.subscriptionId,
      featureCode: subscriptionUsageDTO.featureCode || null,
      currentUsage: subscriptionUsageDTO.currentUsage || null,
      isActive: subscriptionUsageDTO.isActive || null,
      lastResetAt: null,
      periodStart: null,
      periodEnd: null,
    };

    const usage =
      await this.subscriptionService.updateSubscriptionUsage(usageToUpdate);
    return usage;
  }

  async incrementFeatureUsed(
    companyId: string,
    count: number,
    featureCode: string,
  ): Promise<void> {
    await this.subscriptionService.incrementFeatureUsed(
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
    await this.subscriptionService.decrementFeatureUsed(
      companyId,
      count,
      featureCode,
    );
  }

  async handleCompanyDeletedEvent(companyId: string): Promise<void> {
    await this.subscriptionService.handleCompanyDeletedEvent(companyId);
  }
}
