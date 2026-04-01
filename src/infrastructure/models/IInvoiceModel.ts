import { InvoiceStatus } from '@domain/value-objects';

export interface IInvoiceModel {
  id: string;
  subscription_id: string;
  company_id: string;
  invoice_number: string | null;
  amount: number | null;
  currency: string | null;
  status: InvoiceStatus | null;
  billing_period_start: Date | string | null;
  billing_period_end: Date | string | null;
  due_date: Date | string | null;
  paid_at: Date | string | null;
  created_at: Date | string | null;
}
