import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { PlanAppService } from '@application/services';
import { PlanSchema } from '@config/schemas/plan.schema';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';

const route = createRoute({
  method: 'get',
  path: '/plans/:id',
  summary: 'Get a subscription plan by ID',
  description:
    'Retrieves the details of a specific subscription plan by its ID.',
  tags: ['Plan'],
  responses: {
    200: {
      description: 'Plan retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(PlanSchema),
        },
      },
    },
    404: {
      description: 'Plan not found',
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
  planAppService: PlanAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const planId = c.req.param().id;

      const plan = await planAppService.getPlanById(planId);
      if (!plan) {
        const errorResponse = new ApiErrorResponse(
          StatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          `Plan with ID ${planId} not found`,
        );
        return c.json(errorResponse.toJSON(), StatusCode.NOT_FOUND);
      }

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        plan,
        'Plan retrieved successfully',
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
