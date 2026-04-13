import { z } from 'zod';

export const InvoiceResponseSchema = z.object({
  id: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the invoice.',
  }),
  subscriptionId: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Unique identifier for the associated subscription.',
  }),
  companyId: z.string().openapi({
    example: 'company-123',
    description: 'Unique identifier for the associated company.',
  }),
  invoiceNumber: z.string().nullable().openapi({
    example: 'INV-1001',
    description: 'Invoice number, if available.',
  }),
  amount: z.number().nullable().openapi({
    example: 99.99,
    description: 'Total amount for the invoice.',
  }),
  currency: z.string().nullable().openapi({
    example: 'USD',
    description: 'Currency code for the invoice amount.',
  }),
  status: z
    .enum(['PENDING', 'PAID', 'FAILED', 'VOID', 'REFUNDED'])
    .nullable()
    .openapi({
      example: 'PENDING',
      description: 'Current status of the invoice.',
    }),
  billingPeriodStart: z.string().nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Start date of the billing period.',
  }),
  billingPeriodEnd: z.string().nullable().openapi({
    example: '2024-01-31T23:59:59Z',
    description: 'End date of the billing period.',
  }),
  dueDate: z.string().nullable().openapi({
    example: '2024-02-15T23:59:59Z',
    description: 'Due date for the invoice payment.',
  }),
  paidAt: z.string().nullable().openapi({
    example: '2024-02-10T12:00:00Z',
    description: 'Timestamp when the invoice was paid.',
  }),
  createdAt: z.string().nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Timestamp when the invoice was created.',
  }),
});
