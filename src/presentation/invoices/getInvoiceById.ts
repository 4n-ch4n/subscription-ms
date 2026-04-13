import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { InvoiceAppService } from '@application/services';
import { InvoiceResponseSchema } from '@config/schemas/invoice.schema';
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
  path: '/invoices/:id',
  summary: 'Get invoice by ID',
  description: 'Retrieves a specific invoice by its unique identifier.',
  tags: ['Invoice'],
  responses: {
    200: {
      description: 'Invoice retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(InvoiceResponseSchema),
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
      description: 'Invoice not found',
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
      const invoiceId = c.req.param('id');

      const invoice = await invoiceAppService.getInvoiceById(
        invoiceId,
        companyId,
      );
      if (!invoice) {
        const errorResponse = new ApiErrorResponse(
          StatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          `Invoice with ID ${invoiceId} not found for the company.`,
        );
        return c.json(errorResponse.toJSON(), StatusCode.NOT_FOUND);
      }

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        invoice,
        'Invoice retrieved successfully',
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
