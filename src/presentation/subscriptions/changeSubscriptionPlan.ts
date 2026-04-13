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
  planId: z.uuid().openapi({
    example: '12345678-90ab-cdef-1234-567890abcdef',
    description: 'The ID of the subscription plan to switch to.',
  }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).openapi({
    example: 'MONTHLY',
    description: 'The billing cycle for the new subscription plan.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/subscriptions/change-plan',
  summary: 'Change subscription plan',
  description:
    'Changes the subscription plan for the authenticated user based on the provided plan and billing cycle.',
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
      description: 'Subscription plan changed successfully',
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
      description: 'Subscription plan not found',
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
      const { planId, billingCycle } = c.req.valid('json');

      const updatedSubscription =
        await subscriptionAppService.changeSubscriptionPlan(
          companyId,
          planId,
          billingCycle,
        );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        updatedSubscription,
        'Subscription plan changed successfully',
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
