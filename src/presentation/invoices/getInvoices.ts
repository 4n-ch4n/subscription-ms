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
import { InvoiceResponseSchema } from '@config/schemas/invoice.schema';
import { InvoiceAppService } from '@application/services';

const route = createRoute({
  method: 'get',
  path: '/invoices',
  summary: 'Get invoices',
  description: 'Retrieves a list of invoices for the authenticated user.',
  tags: ['Invoice'],
  responses: {
    200: {
      description: 'Invoices retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            total: z.number().openapi({
              example: 100,
              description: 'Total number of invoices.',
            }),
            data: z.array(InvoiceResponseSchema).openapi({
              description: 'List of invoices.',
            }),
          })),
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
  invoiceAppService: InvoiceAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const companyId = c.get('jwtPayload').companyId;
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);

      const invoicesResponse = await invoiceAppService.getInvoices(companyId, {
        limit: limit,
        offset: (page - 1) * limit,
      });

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        invoicesResponse,
        'Invoices retrieved successfully',
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
