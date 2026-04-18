import { z } from 'zod';

export const PlanSchema = z.object({
    id: z.uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Unique identifier for the subscription plan.',
    }),
    name: z.string().nullable().openapi({
        example: 'Pro Plan',
        description: 'Name of the subscription plan.',
    }),
    description: z.string().nullable().openapi({
        example: 'Access to all premium features.',
        description: 'Detailed description of the subscription plan.',
    }),
    price: z.number().nullable().openapi({
        example: 29.99,
        description: 'Price of the subscription plan in USD.',
    }),
    features: z.array(z.object({
        id: z.uuid().openapi({
            example: '123e4567-e89b-12d3-a456-426614174001',
            description: 'Unique identifier for the plan feature.',
        }),
        planId: z.uuid().openapi({
            example: '123e4567-e89b-12d3-a456-426614174000',
            description: 'Identifier of the associated subscription plan.',
        }),
        featureCode: z.string().openapi({
            example: 'API_ACCESS',
            description: 'Code representing the specific feature included in the plan.',
        }),
        limitValue: z.number().nullable().openapi({
            example: 1000,
            description: 'Limit value for the feature, if applicable (e.g., API call limit).',
        }),
        isEnabled: z.boolean().nullable().openapi({
            example: true,
            description: 'Indicates whether the feature is enabled for the subscription plan.',
        }),
        isResettable: z.boolean().openapi({
            example: true,
            description: 'Indicates whether the feature usage limit resets every billing cycle.',
        }),
    })).openapi({
        description: 'List of features included in the subscription plan.',
    }),
});