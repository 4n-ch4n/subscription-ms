import { z } from 'zod';

export const SubscriptionUsageResponseSchema = z.object({
  id: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the subscription usage record.',
  }),
  subscriptionId: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Identifier for the associated subscription.',
  }),
  featureCode: z.string().nullable().openapi({
    example: 'API_CALLS',
    description: 'Code representing the feature being tracked.',
  }),
  currentUsage: z.number().nullable().openapi({
    example: 150,
    description: 'Current usage count for the feature.',
  }),
  isActive: z.boolean().nullable().openapi({
    example: true,
    description: 'Indicates if the usage record is active.',
  }),
  lastResetAt: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Date and time when the usage was last reset.',
  }),
  periodStart: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Start date of the current usage period.',
  }),
  periodEnd: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-31T23:59:59Z',
    description: 'End date of the current usage period.',
  }),
});

export const SubscriptionResponseSchema = z.object({
  id: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the subscription.',
  }),
  companyId: z.string().openapi({
    example: 'company_123',
    description: 'Identifier for the company associated with the subscription.',
  }),
  planId: z.uuid().nullable().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'Identifier for the subscription plan. Can be null if no plan is associated.',
  }),
  status: z
    .enum(['ACTIVE', 'TRIALING', 'PENDING', 'CANCELLED'])
    .nullable()
    .openapi({
      example: 'ACTIVE',
      description: 'Current status of the subscription.',
    }),
  startDate: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Start date of the subscription.',
  }),
  endDate: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-12-31T23:59:59Z',
    description: 'End date of the subscription.',
  }),
  nextBillingDate: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-02-01T00:00:00Z',
    description: 'Next billing date for the subscription.',
  }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).nullable().openapi({
    example: 'MONTHLY',
    description: 'Billing cycle for the subscription.',
  }),
  autoRenew: z.boolean().nullable().openapi({
    example: true,
    description: 'Indicates if the subscription is set to auto-renew.',
  }),
  cancelReason: z.string().nullable().openapi({
    example: 'No longer needed',
    description: 'Reason for cancellation, if applicable.',
  }),
  canceledAt: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-15T12:00:00Z',
    description: 'Date and time when the subscription was cancelled.',
  }),
  createdAt: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Date and time when the subscription was created.',
  }),
  updatedAt: z.union([z.string(), z.date()]).nullable().openapi({
    example: '2024-01-10T12:00:00Z',
    description: 'Date and time when the subscription was last updated.',
  }),
  usages: z.array(SubscriptionUsageResponseSchema).openapi({
    description: 'List of usage records associated with the subscription.',
  }),
});
