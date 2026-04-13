import { Invoice } from '@domain/entities';
import { InvoiceService } from '@domain/services';
import { PaginatedResult, PaginationQuery } from '@domain/value-objects';

export class InvoiceAppService {
  constructor(private invoiceService: InvoiceService) {}

  async getInvoices(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Invoice>> {
    const response = await this.invoiceService.getInvoices(
      companyId,
      pagination,
    );
    return response;
  }

  async getInvoiceById(
    invoiceId: string,
    companyId: string,
  ): Promise<Invoice | null> {
    const invoice = await this.invoiceService.getInvoiceById(
      invoiceId,
      companyId,
    );
    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceService.markInvoiceAsPaid(invoiceId);
    return invoice;
  }

  async markInvoiceAsPaymentFailed(invoiceId: string): Promise<Invoice> {
    const invoice =
      await this.invoiceService.markInvoiceAsPaymentFailed(invoiceId);
    return invoice;
  }
}
