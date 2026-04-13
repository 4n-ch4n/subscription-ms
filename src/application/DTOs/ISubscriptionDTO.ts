export interface ISubscriptionDTO {
  id?: string;
  companyId: string;
  planId?: string;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
}
