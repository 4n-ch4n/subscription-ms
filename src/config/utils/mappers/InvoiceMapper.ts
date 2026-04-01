import { Invoice } from "@domain/entities";
import { IInvoiceModel } from "@infrastructure/models";

export class InvoiceMapper {
    public static mapInvoiceModelToEntity = (rows: IInvoiceModel[]): Invoice[] => {
        if (!rows.length) return [];

        const invoicesMap = new Map<string, Invoice>();

        for (const row of rows) {
            const invoiceId = row.id;

            let invoice = invoicesMap.get(invoiceId);
            if (!invoice) {
                invoice = new Invoice({
                    id: row.id,
                    subscriptionId: row.subscription_id,
                    companyId: row.company_id,
                    invoiceNumber: row.invoice_number,
                    amount: row.amount,
                    currency: row.currency,
                    status: row.status,
                    billingPeriodStart: row.billing_period_start,
                    billingPeriodEnd: row.billing_period_end,
                    dueDate: row.due_date,
                    paidAt: row.paid_at,
                    createdAt: row.created_at,
                });
                invoicesMap.set(invoiceId, invoice);
            }
        }

        return Array.from(invoicesMap.values());
    }

    public static mapInvoiceEntityToModel = (invoice: Invoice): IInvoiceModel => {
        return {
            id: invoice.id,
            subscription_id: invoice.subscriptionId,
            company_id: invoice.companyId,
            invoice_number: invoice.invoiceNumber,
            amount: invoice.amount,
            currency: invoice.currency,
            status: invoice.status,
            billing_period_start: invoice.billingPeriodStart,
            billing_period_end: invoice.billingPeriodEnd,
            due_date: invoice.dueDate,
            paid_at: invoice.paidAt,
            created_at: invoice.createdAt,
        };
    };
}