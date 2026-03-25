import { Plan } from "@domain/entities";

export interface IPlanRepository {
    getPlanById(id: string): Promise<Plan | null>;
    getPlans(): Promise<Plan[]>;
}