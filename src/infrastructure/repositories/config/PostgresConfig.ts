import { Pool } from 'pg';
import { envs } from '@config';

export interface IPostgres {
  postgresDb: Pool;
}

export class PostgresConfig implements IPostgres {
  private static instance: PostgresConfig;
  private db: Pool;

  private constructor(private environments: typeof envs) {
    this.db = new Pool({
      host: this.environments.postgres.host,
      port: this.environments.postgres.port,
      user: this.environments.postgres.user,
      password: this.environments.postgres.password,
      database: this.environments.postgres.database,
    });
  }

  public static getInstance(environments: typeof envs): PostgresConfig {
    if (!PostgresConfig.instance) {
      PostgresConfig.instance = new PostgresConfig(environments);
    }
    return PostgresConfig.instance;
  }

  public get postgresDb(): Pool {
    return this.db;
  }
}
