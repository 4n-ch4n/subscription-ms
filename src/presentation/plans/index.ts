import { JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { PlanAppService } from '@application/services';
import { PlanService } from '@domain/services';
import { PlanRepository } from '@infrastructure/repositories';
import { PostgresConfig } from '@infrastructure/repositories/config';
import { envs } from '@config';
import getPlans from './getPlans';
import getPlanById from './getPlanById';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const postgresDb = PostgresConfig.getInstance(envs);

const planRepository = new PlanRepository(postgresDb);

const planService = new PlanService(planRepository);

const planAppService = new PlanAppService(planService);

app.openapi(getPlans.route, getPlans.createHandler(planAppService));
app.openapi(getPlanById.route, getPlanById.createHandler(planAppService));

export default app;
