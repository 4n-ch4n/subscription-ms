import { Invoice } from '@domain/entities';
import { PaginatedResult, PaginationQuery } from '@domain/value-objects';
import { PoolClient } from 'pg';

export interface IInvoiceRepository {
  getInvoicesByCompanyId(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Invoice>>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Invoice, connection?: PoolClient): Promise<void>;
  updateInvoice(invoice: Invoice, connection?: PoolClient): Promise<void>;
}
