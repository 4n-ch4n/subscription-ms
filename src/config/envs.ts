export const envs = {
  secretJwt: process.env.JWT_SECRET || '',
  port: Number(process.env.PORT) || 3000,
  hostname: process.env.HOSTNAME ?? 'localhost',
  baseUrl: process.env.API_BASE_URL ?? '/api',
  docsUrl: process.env.DOCS_URL ?? '/public/api-docs',
  openApiUrl: process.env.OPENAPI_URL ?? '/public/openapi.json',
  postgres: {
    database: process.env.DB_SUBSCRIPTION_DATABASE || '',
    port: Number(process.env.DB_SUBSCRIPTION_PORT) || 5432,
    host: process.env.DB_SUBSCRIPTION_HOST || '',
    password: process.env.DB_SUBSCRIPTION_PASSWORD || '',
    user: process.env.DB_SUBSCRIPTION_USER || '',
  },
};
