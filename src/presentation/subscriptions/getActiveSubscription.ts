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
import { JwtVariables } from 'hono/jwt';

const route = createRoute({
  method: 'get',
  path: '/subscriptions/active',
  summary: 'Get active subscription',
  description: 'Retrieves the active subscription for the authenticated user.',
  tags: ['Subscription'],
  responses: {
    200: {
      description: 'Active subscription retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(SubscriptionResponseSchema),
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
      description: 'Active subscription not found',
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

      const activeSubscription =
        await subscriptionAppService.getActiveSubscription(companyId);
      if (!activeSubscription) {
        const errorResponse = new ApiErrorResponse(
          StatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          'Active subscription not found',
        );
        return c.json(errorResponse.toJSON(), StatusCode.NOT_FOUND);
      }

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        activeSubscription,
        'Active subscription retrieved successfully',
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
