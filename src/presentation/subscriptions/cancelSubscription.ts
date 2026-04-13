import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { SubscriptionResponseSchema } from '@config/schemas/subscription.schema';
import { SubscriptionAppService } from '@application/services';

const route = createRoute({
  method: 'delete',
  path: '/subscriptions/:subscriptionId',
  summary: 'Cancel a subscription',
  description: 'Cancels an active subscription for the authenticated user.',
  tags: ['Subscription'],
  responses: {
    200: {
      description: 'Subscription cancelled successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(SubscriptionResponseSchema),
        },
      },
    },
    400: {
      description: 'Bad Request - Invalid subscription ID or company ID',
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
      const subscriptionId = c.req.param('subscriptionId');

      const cancelledSubscription =
        await subscriptionAppService.cancelSubscription(
          subscriptionId,
          companyId,
        );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        cancelledSubscription,
        'Subscription cancelled successfully',
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
