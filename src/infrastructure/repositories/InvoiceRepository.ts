import { PoolClient } from 'pg';
import { Invoice } from '@domain/entities';
import { IInvoiceRepository } from '@domain/repositories';
import { PaginationQuery, PaginatedResult } from '@domain/value-objects';
import { dynamicFieldsToUpdate, QueryBuilder } from '@config/utils';
import { IInvoiceModel } from '@infrastructure/models';
import { IPostgres } from './config';
import { InvoiceMapper } from '@config/utils/mappers';

export class InvoiceRepository implements IInvoiceRepository {
  private postgresEntity: string = 'invoices';

  constructor(private db: IPostgres) {}

  async getInvoicesByCompanyId(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Invoice>> {
    const query = new QueryBuilder(this.postgresEntity)
      .addCondition('company_id = $1')
      .setLimit(pagination.limit)
      .setOffset(pagination.offset)
      .build();

    const { rows } = await this.db.postgresDb.query<IInvoiceModel>(query, [
      companyId,
    ]);

    const invoices = InvoiceMapper.mapInvoiceModelToEntity(rows);

    const totalRowsQuery = new QueryBuilder(this.postgresEntity)
      .setColumns(`COUNT(DISTINCT id) AS total`)
      .addCondition('company_id = $1')
      .build();

    const { rows: totalRows } = await this.db.postgresDb.query(totalRowsQuery, [
      companyId,
    ]);

    return {
      data: invoices,
      total: parseInt(totalRows[0].total, 10),
    };
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const query = new QueryBuilder(this.postgresEntity)
      .addCondition('id = $1')
      .build();

    const { rows } = await this.db.postgresDb.query<IInvoiceModel>(query, [id]);

    return InvoiceMapper.mapInvoiceModelToEntity(rows)[0] || null;
  }

  async createInvoice(
    invoice: Invoice,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const invoiceToSave = InvoiceMapper.mapInvoiceEntityToModel(invoice);
    await db.query(
      `INSERT INTO ${this.postgresEntity} 
      (id, subscription_id, company_id, invoice_number, amount, currency, status, billing_period_start, billing_period_end, due_date, paid_at, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        invoiceToSave.id,
        invoiceToSave.subscription_id,
        invoiceToSave.company_id,
        invoiceToSave.invoice_number,
        invoiceToSave.amount,
        invoiceToSave.currency,
        invoiceToSave.status,
        invoiceToSave.billing_period_start,
        invoiceToSave.billing_period_end,
        invoiceToSave.due_date,
        invoiceToSave.paid_at,
        invoiceToSave.created_at,
      ],
    );
  }

  async updateInvoice(
    invoice: Invoice,
    connection?: PoolClient,
  ): Promise<void> {
    const db = connection || this.db.postgresDb;

    const invoiceToUpdate = InvoiceMapper.mapInvoiceEntityToModel(invoice);
    const [fieldsToUpdate, valuesToUpdate] = dynamicFieldsToUpdate(
      invoiceToUpdate,
      'id',
    );
    await db.query(
      `UPDATE ${this.postgresEntity} SET ${fieldsToUpdate.join(', ')} WHERE id = $${fieldsToUpdate.length + 1}`,
      valuesToUpdate,
    );
  }
}
