export interface ISubscriptionUsageModel {
  usage_id: string;
  subscription_id: string;
  feature_code: string | null;
  current_usage: number | null;
  is_active: boolean | null;
  last_reset_at: Date | string | null;
  period_start: Date | string | null;
  period_end: Date | string | null;
}
