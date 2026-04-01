import { Plan } from '@domain/entities';
import { IPlanRepository } from '@domain/repositories';
import { IPostgres } from './config';
import { IPlanFeatureModel, IPlanModel } from '@infrastructure/models';
import { QueryBuilder } from '@config/utils/QueryBuilder';
import { PlanMapper } from '@config/utils/mappers';

export class PlanRepository implements IPlanRepository {
  private postgresEntity: string = 'plans';

  constructor(private db: IPostgres) {}

  async getPlanById(id: string): Promise<Plan | null> {
    const query = new QueryBuilder(this.postgresEntity)
      .setColumns(`${this.postgresEntity}.*, pf.*`)
      .addJoin(
        `INNER JOIN plan_features pf ON (${this.postgresEntity}.id = pf.plan_id)`,
      )
      .addCondition(`${this.postgresEntity}.id = $1`)
      .build();

    const { rows } = await this.db.postgresDb.query(
      query,
      [id],
    );

    return PlanMapper.mapPlanModelToEntity(rows)[0] || null;
  }

  async getPlans(): Promise<Plan[]> {
    const query = new QueryBuilder(this.postgresEntity)
      .setColumns(`${this.postgresEntity}.*, pf.*`)
      .addJoin(
        `INNER JOIN plan_features pf ON (${this.postgresEntity}.id = pf.plan_id)`,
      )
      .build();

    const { rows } = await this.db.postgresDb.query(query);

    return PlanMapper.mapPlanModelToEntity(rows);
  }
}
