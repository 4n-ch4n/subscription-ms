import { z } from 'zod';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { SubscriptionAppService } from '@application/services';
import { JwtVariables } from 'hono/jwt';

const RequestBodySchema = z.object({
  id: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the subscription usage to update.',
  }),
  subscriptionId: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the subscription associated with this usage.',
  }),
  featureCode: z.string().optional().openapi({
    example: 'API_CALLS',
    description: 'The code of the feature for which usage is being tracked.',
  }),
  currentUsage: z.number().optional().openapi({
    example: 100,
    description: 'The current usage count for the specified feature.',
  }),
  isActive: z.boolean().optional().openapi({
    example: true,
    description: 'Indicates whether this usage record is active.',
  }),
});

const ResponseSchema = z.object({
  id: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the updated subscription usage record.',
  }),
  subscriptionId: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the subscription associated with this usage.',
  }),
  featureCode: z.string().nullable().openapi({
    example: 'API_CALLS',
    description: 'The code of the feature for which usage is being tracked.',
  }),
  currentUsage: z.number().nullable().openapi({
    example: 100,
    description: 'The current usage count for the specified feature.',
  }),
  isActive: z.boolean().nullable().openapi({
    example: true,
    description: 'Indicates whether this usage record is active.',
  }),
  lastResetAt: z.string().nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'The timestamp when the usage was last reset.',
  }),
  periodStart: z.string().nullable().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'The start timestamp of the current billing period.',
  }),
  periodEnd: z.string().nullable().openapi({
    example: '2024-01-31T23:59:59Z',
    description: 'The end timestamp of the current billing period.',
  }),
});

const route = createRoute({
  method: 'patch',
  path: '/subscriptions/usage',
  summary: 'Update subscription usage',
  description:
    'Updates the usage information for a specific subscription feature.',
  tags: ['Subscription'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Subscription usage updated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(ResponseSchema),
        },
      },
    },
    400: {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Missing or invalid JWT token',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Subscription usage record not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const createHandler = (
  subscriptionAppService: SubscriptionAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const usageUpdateDTO = c.req.valid('json');

      const updatedUsage =
        await subscriptionAppService.updateSubscriptionUsage(usageUpdateDTO);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        updatedUsage,
        'Subscription usage updated successfully',
      );
      return c.json(response.toJSON(), StatusCode.OK);
    } catch (error) {
      if (error instanceof ApiErrorResponse) {
        return c.json(error.toJSON(), error.status as any);
      }

      const errorResponse = new ApiErrorResponse(
        StatusCode.INTERNAL_ERROR,
        ErrorCode.UNKNOWN,
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );

      return c.json(errorResponse.toJSON(), StatusCode.INTERNAL_ERROR);
    }
  };
};

export default {
  route,
  createHandler,
};
