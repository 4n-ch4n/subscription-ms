import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { SubscriptionAppService } from '@application/services';
import {
  ApiErrorResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
} from '@config/schemas/response';
import { requirePermission } from '../middlewares';

const route = createRoute({
  method: 'delete',
  path: '/subscriptions/company',
  summary: 'Delete company subscription',
  description:
    'Deletes the company subscription associated with the authenticated user.',
  tags: ['Subscription'],
  middleware: [requirePermission('company:delete')],
  responses: {
    204: {
      description: 'Company subscription deleted successfully',
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
      description: 'Company subscription not found',
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

      await subscriptionAppService.handleCompanyDeletedEvent(companyId);

      return c.body(null, StatusCode.NO_CONTENT);
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
