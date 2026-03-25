import { Plan } from "@domain/entities";
import { IPlanRepository } from "@domain/repositories";

export class PlanService {
    constructor(private planRepository: IPlanRepository) { }

    async getPlans(): Promise<Plan[]> {
        const plans = await this.planRepository.getPlans();
        return plans;
    }

    async getPlanById(id: string): Promise<Plan | null> {
        const plan = await this.planRepository.getPlanById(id);
        if (!plan) return null;

        return plan;
    }
}