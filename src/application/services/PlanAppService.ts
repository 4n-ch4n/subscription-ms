import { Plan } from '@domain/entities';
import { PlanService } from '@domain/services';

export class PlanAppService {
  constructor(private planService: PlanService) {}

  async getPlans(): Promise<Plan[]> {
    const plans = await this.planService.getPlans();
    return plans;
  }

  async getPlanById(id: string): Promise<Plan | null> {
    const plan = await this.planService.getPlanById(id);
    return plan;
  }
}
