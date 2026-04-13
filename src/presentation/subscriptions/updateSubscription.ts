import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
  ApiSuccessResponse,
} from '@config/schemas/response';
import { SubscriptionResponseSchema } from '@config/schemas/subscription.schema';
import { SubscriptionAppService } from '@application/services';

const RequestBodySchema = z.object({
  id: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the subscription to update.',
  }),
  planId: z.uuid().optional().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the new plan for the subscription.',
  }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional().openapi({
    example: 'MONTHLY',
    description: 'The new billing cycle for the subscription.',
  }),
});

const route = createRoute({
  method: 'patch',
  path: '/subscriptions',
  summary: 'Update an existing subscription',
  description:
    'Updates an existing subscription for the authenticated user based on the provided subscription ID and optional new plan and billing cycle.',
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
      description: 'Subscription updated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(SubscriptionResponseSchema),
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
      description: 'Subscription not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal Server Error',
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
      const companyId = c.get('jwtPayload').companyId;
      const subscriptionDTO = c.req.valid('json');

      const updatedSubscription =
        await subscriptionAppService.updateSubscription({
          ...subscriptionDTO,
          companyId,
        });

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        updatedSubscription,
        'Subscription updated successfully',
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
