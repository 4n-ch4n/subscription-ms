import { JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { envs, TransactionManager } from '@config';
import {
  InvoiceRepository,
  PlanRepository,
  SubscriptionRepository,
} from '@infrastructure/repositories';
import { PostgresConfig } from '@infrastructure/repositories/config';
import { SubscriptionService } from '@domain/services';
import { SubscriptionAppService } from '@application/services';
import cancelSubscription from './cancelSubscription';
import changeSubscriptionPlan from './changeSubscriptionPlan';
import createSubscription from './createSubscription';
import decrementFeatureUsed from './decrementFeatureUsed';
import deleteCompany from './deleteCompany';
import getActiveSubscription from './getActiveSubscription';
import getSubscriptionById from './getSubscriptionById';
import getSubscriptionsByCompanyId from './getSubscriptionsByCompanyId';
import hasAccessToFeature from './hasAccessToFeature';
import incrementFeatureUsed from './incrementFeatureUsed';
import updateSubscription from './updateSubscription';
import updateSubscriptionUsage from './updateSubscriptionUsage';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const postgresDb = PostgresConfig.getInstance(envs);

const subscriptionRepository = new SubscriptionRepository(postgresDb);
const planRepository = new PlanRepository(postgresDb);
const invoiceRepository = new InvoiceRepository(postgresDb);

const transactionManager = new TransactionManager(postgresDb);

const subscriptionService = new SubscriptionService(
  planRepository,
  subscriptionRepository,
  invoiceRepository,
  transactionManager,
);

const subscriptionAppService = new SubscriptionAppService(subscriptionService);

app.openapi(
  cancelSubscription.route,
  cancelSubscription.createHandler(subscriptionAppService),
);
app.openapi(
  changeSubscriptionPlan.route,
  changeSubscriptionPlan.createHandler(subscriptionAppService),
);
app.openapi(
  createSubscription.route,
  createSubscription.createHandler(subscriptionAppService),
);
app.openapi(
  decrementFeatureUsed.route,
  decrementFeatureUsed.createHandler(subscriptionAppService),
);
app.openapi(
  deleteCompany.route,
  deleteCompany.createHandler(subscriptionAppService),
);
app.openapi(
  getActiveSubscription.route,
  getActiveSubscription.createHandler(subscriptionAppService),
);
app.openapi(
  getSubscriptionById.route,
  getSubscriptionById.createHandler(subscriptionAppService),
);
app.openapi(
  getSubscriptionsByCompanyId.route,
  getSubscriptionsByCompanyId.createHandler(subscriptionAppService),
);
app.openapi(
  hasAccessToFeature.route,
  hasAccessToFeature.createHandler(subscriptionAppService),
);
app.openapi(
  incrementFeatureUsed.route,
  incrementFeatureUsed.createHandler(subscriptionAppService),
);
app.openapi(
  updateSubscription.route,
  updateSubscription.createHandler(subscriptionAppService),
);
app.openapi(
  updateSubscriptionUsage.route,
  updateSubscriptionUsage.createHandler(subscriptionAppService),
);

export default app;
