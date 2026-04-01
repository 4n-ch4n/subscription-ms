import { Plan } from '@domain/entities';
import { IPlanFeature } from '@domain/value-objects';
import { IPlanFeatureModel, IPlanModel } from '@infrastructure/models';

export class PlanMapper {
  public static mapPlanModelToEntity = (
    rows: (IPlanModel & IPlanFeatureModel)[],
  ): Plan[] => {
    if (!rows.length) return [];

    const plansMap = new Map<string, Plan>();
    const featuresMap = new Map<string, Map<string, IPlanFeature>>();

    for (const row of rows) {
      const planId = row.id;

      let plan = plansMap.get(planId);
      if (!plan) {
        plan = new Plan({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
        });

        plan.features = [];
        plansMap.set(planId, plan);
        featuresMap.set(planId, new Map());
      }

      if (row.feature_id) {
        const feature = featuresMap.get(planId)!;
        if (!feature.has(row.feature_id)) {
          const planFeature: IPlanFeature = {
            id: row.feature_id,
            planId: row.plan_id,
            featureCode: row.feature_code,
            limitValue: row.limit_value,
            isEnabled: row.is_enabled,
          };

          feature.set(row.feature_id, planFeature);
        }
      }
    }

    for (const [planId, plan] of plansMap) {
      plan.features = Array.from(featuresMap.get(planId)?.values() ?? []);
    }

    return Array.from(plansMap.values());
  };
}
