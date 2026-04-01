export interface IPlanFeatureModel {
  feature_id: string;
  plan_id: string;
  feature_code: string;
  limit_value: number | null;
  is_enabled: boolean | null;
}
