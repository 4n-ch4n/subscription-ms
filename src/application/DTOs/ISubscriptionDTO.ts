export interface ISubscriptionDTO {
  companyId: string;
  planId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
}
