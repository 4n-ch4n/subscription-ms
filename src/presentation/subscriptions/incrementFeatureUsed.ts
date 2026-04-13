import { z } from 'zod';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
} from '@config/schemas/response';
import { JwtVariables } from 'hono/jwt';
import { SubscriptionAppService } from '@application/services';

const RequestBodySchema = z.object({
  count: z.number().openapi({
    example: 1,
    description: 'The number of times to increment the feature usage.',
  }),
  featureCode: z.string().openapi({
    example: 'API_CALLS',
    description: 'The code of the feature for which usage is being tracked.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/subscriptions/increment-feature-used',
  summary: 'Increment feature usage',
  description:
    'Increments the usage count of a specific feature for the authenticated user.',
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
      description: 'Feature usage incremented successfully',
    },
    400: {
      description: 'Bad Request - Invalid input data',
      response: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    401: {
      description: 'Unauthorized - Missing or invalid JWT token',
      response: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    404: {
      description: 'Subscription or feature not found',
      response: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
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
      const { count, featureCode } = c.req.valid('json');

      await subscriptionAppService.incrementFeatureUsed(
        companyId,
        count,
        featureCode,
      );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        null,
        'Feature usage incremented successfully',
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
