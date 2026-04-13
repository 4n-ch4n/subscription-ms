import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { InvoiceResponseSchema } from '@config/schemas/invoice.schema';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { InvoiceAppService } from '@application/services';

const WebhookPayloadSchema = z.object({
  eventId: z.string().openapi({ example: 'evt_1M5Xcd2eZvKYlo2C01s12345' }),
  eventType: z.literal('invoice.payment_succeeded').openapi({ example: 'invoice.payment_succeeded' }),
  data: z.object({
    invoiceId: z.string().openapi({ description: 'The ID of the invoice paid' }),
    amountPaid: z.number().openapi({ example: 4900, description: 'Amount paid' }),
  }),
});

const route = createRoute({
  method: 'post',
  path: '/webhooks/mock-payment',
  summary: 'Simulated Payment Webhook',
  description: 'Simulates an external payment gateway webhook (e.g. Stripe) for a successful payment. In a real-world scenario, this endpoint would verify the cryptographic signature header before processing.',
  tags: ['Webhooks (Simulation)'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: WebhookPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Invoice marked as paid successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(InvoiceResponseSchema),
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid webhook signature',
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
      const payload = c.req.valid('json');

      // In a production environment, verify the external webhook signature here:
      // const signature = c.req.header('Stripe-Signature');
      // verifyWebhookSignature(rawBody, signature, envs.webhookSecret);

      const invoiceId = payload.data.invoiceId;

      const invoice = await invoiceAppService.markInvoiceAsPaid(invoiceId);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        invoice,
        'Invoice marked as paid successfully',
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
