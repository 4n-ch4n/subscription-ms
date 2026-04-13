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
import { PlanSchema } from '@config/schemas/plan.schema';
import { PlanAppService } from '@application/services';

const route = createRoute({
  method: 'get',
  path: '/plans',
  summary: 'Get all subscription plans',
  description: 'Retrieves a list of all available subscription plans.',
  tags: ['Plan'],
  responses: {
    200: {
      description: 'Plans retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.array(PlanSchema)).openapi({
            description: 'List of subscription plans.',
          }),
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
  planAppService: PlanAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const plans = await planAppService.getPlans();

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        plans,
        'Plans retrieved successfully',
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
