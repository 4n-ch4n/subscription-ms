import { InvoiceStatus } from "@domain/value-objects";

export class Invoice {
    public id: string;
    public subscriptionId: string;
    public companyId: string;
    public invoiceNumber: string | null;
    public amount: number | null;
    public currency: string | null;
    public status: InvoiceStatus | null;
    public billingPeriodStart: Date | string | null;
    public billingPeriodEnd: Date | string | null;
    public dueDate: Date | string | null;
    public paidAt: Date | string | null;
    public createdAt: Date | string | null;

    constructor({
        id,
        subscriptionId,
        companyId,
        invoiceNumber = null,
        amount = null,
        currency = null,
        status = null,
        billingPeriodStart = null,
        billingPeriodEnd = null,
        dueDate = null,
        paidAt = null,
        createdAt = null,
    }: {
        id: string;
        subscriptionId: string;
        companyId: string;
        invoiceNumber?: string | null;
        amount?: number | null;
        currency?: string | null;
        status?: InvoiceStatus | null;
        billingPeriodStart?: Date | string | null;
        billingPeriodEnd?: Date | string | null;
        dueDate?: Date | string | null;
        paidAt?: Date | string | null;
        createdAt?: Date | string | null;
    }) {
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.companyId = companyId;
        this.invoiceNumber = invoiceNumber;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.billingPeriodStart = billingPeriodStart;
        this.billingPeriodEnd = billingPeriodEnd;
        this.dueDate = dueDate;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }
}
