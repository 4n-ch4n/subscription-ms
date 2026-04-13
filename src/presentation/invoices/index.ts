import { jwt, JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { PostgresConfig } from '@infrastructure/repositories/config';
import { InvoiceRepository } from '@infrastructure/repositories';
import { envs } from '@config';
import { InvoiceService } from '@domain/services';
import { InvoiceAppService } from '@application/services';
import getInvoiceById from './getInvoiceById';
import getInvoices from './getInvoices';
import markInvoiceAsPaid from './markInvoiceAsPaid';
import markInvoiceAsPaymentFailed from './markInvoiceAsPaymentFailed';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const postgresDb = PostgresConfig.getInstance(envs);

const invoiceRepository = new InvoiceRepository(postgresDb);

const invoiceService = new InvoiceService(invoiceRepository);

const invoiceAppService = new InvoiceAppService(invoiceService);

app.openapi(
  markInvoiceAsPaid.route,
  markInvoiceAsPaid.createHandler(invoiceAppService),
);
app.openapi(
  markInvoiceAsPaymentFailed.route,
  markInvoiceAsPaymentFailed.createHandler(invoiceAppService),
);

app.use(
  '*',
  jwt({
    secret: envs.secretJwt,
    alg: 'HS256',
  }),
);

app.openapi(
  getInvoiceById.route,
  getInvoiceById.createHandler(invoiceAppService),
);
app.openapi(getInvoices.route, getInvoices.createHandler(invoiceAppService));

export default app;
