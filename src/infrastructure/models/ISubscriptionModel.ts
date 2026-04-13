import { SubscriptionStatus } from '@domain/value-objects';

export interface ISubscriptionModel {
  id: string;
  company_id: string;
  plan_id: string | null;
  status: SubscriptionStatus | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  next_billing_date: Date | string | null;
  billing_cycle: 'MONTHLY' | 'ANNUAL' | null;
  auto_renew: boolean | null;
  cancel_reason: string | null;
  canceled_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}
