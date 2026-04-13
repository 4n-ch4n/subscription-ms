import { z } from 'zod';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { SubscriptionResponseSchema } from '@config/schemas/subscription.schema';
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

const route = createRoute({
  method: 'get',
  path: '/subscriptions',
  summary: 'Get subscriptions by company ID',
  description:
    'Retrieves a paginated list of subscriptions for a specific company.',
  tags: ['Subscription'],
  responses: {
    200: {
      description: 'Subscriptions retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z.object({
              total: z.number().openapi({
                example: 50,
                description: 'Total number of subscriptions for the company.',
              }),
              data: z.array(SubscriptionResponseSchema).openapi({
                description: 'List of subscriptions for the company.',
              }),
            }),
          ),
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
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);

      const subscriptionResponse =
        await subscriptionAppService.getSubscriptionsByCompanyId(companyId, {
          limit: limit,
          offset: (page - 1) * limit,
        });

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        subscriptionResponse,
        'Subscriptions retrieved successfully',
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
