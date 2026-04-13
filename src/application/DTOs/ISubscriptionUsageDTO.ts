export interface ISubscriptionUsageDTO {
  id: string;
  subscriptionId: string;
  featureCode?: string;
  currentUsage?: number;
  isActive?: boolean;
}
