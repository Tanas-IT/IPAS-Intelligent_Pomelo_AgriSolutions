export interface GrowthStageRequest {
  growthStageId: number;
  growthStageName: string;
  description: string;
  monthAgeStart: number;
  monthAgeEnd: number;
  activeFunction: string;
}
