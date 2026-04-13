import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { SubscriptionAppService } from '@application/services';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { SubscriptionResponseSchema } from '@config/schemas/subscription.schema';

const route = createRoute({
  method: 'get',
  path: '/subscriptions/:id',
  summary: 'Get subscription by ID',
  description: 'Retrieves a specific subscription by its unique identifier.',
  tags: ['Subscription'],
  responses: {
    200: {
      description: 'Subscription retrieved successfully',
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
      const subscriptionId = c.req.param('id');

      const subscription =
        await subscriptionAppService.getSubscriptionById(subscriptionId);
      if (!subscription) {
        const errorResponse = new ApiErrorResponse(
          StatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          'Subscription not found',
        );
        return c.json(errorResponse.toJSON(), StatusCode.NOT_FOUND);
      }

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        subscription,
        'Subscription retrieved successfully',
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
