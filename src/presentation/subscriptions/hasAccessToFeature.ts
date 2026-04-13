import { z } from 'zod';
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
import { SubscriptionAppService } from '@application/services';

const route = createRoute({
  method: 'get',
  path: '/subscriptions/has-access/:featureCode',
  summary: 'Check access to feature',
  description:
    'Checks if the authenticated user has access to a specific feature.',
  tags: ['Subscription'],
  responses: {
    200: {
      description: 'Access check completed successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z.object({
              hasAccess: z.boolean().openapi({
                example: true,
                description:
                  'Indicates whether the user has access to the feature.',
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
      const featureCode = c.req.param('featureCode');

      const hasAccess = await subscriptionAppService.hasAccessToFeature(
        companyId,
        featureCode,
      );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        {
          hasAccess,
        },
        'Access check completed successfully',
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
