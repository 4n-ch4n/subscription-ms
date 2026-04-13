import {
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
} from '@config/schemas/response';
import { Invoice } from '@domain/entities';
import { IInvoiceRepository } from '@domain/repositories';
import { PaginationQuery, PaginatedResult } from '@domain/value-objects';

export class InvoiceService {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async getInvoices(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<Invoice>> {
    const queryResponse = await this.invoiceRepository.getInvoicesByCompanyId(
      companyId,
      pagination,
    );
    return queryResponse;
  }

  async getInvoiceById(
    invoiceId: string,
    companyId: string,
  ): Promise<Invoice | null> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);
    if (!invoice || invoice.companyId !== companyId) {
      return null;
    }

    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new ApiErrorResponse(
        StatusCode.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        'Invoice not found',
      );
    }

    if (invoice.status === 'PAID') {
      throw new ApiErrorResponse(
        StatusCode.BAD_REQUEST,
        ErrorCode.FAILURE,
        'Invoice is already paid',
      );
    }

    invoice.status = 'PAID';
    invoice.paidAt = new Date();

    await this.invoiceRepository.updateInvoice(invoice);
    return invoice;
  }

  async markInvoiceAsPaymentFailed(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new ApiErrorResponse(
        StatusCode.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        'Invoice not found',
      );
    }

    invoice.status = 'FAILED';

    await this.invoiceRepository.updateInvoice(invoice);
    return invoice;
  }
}
