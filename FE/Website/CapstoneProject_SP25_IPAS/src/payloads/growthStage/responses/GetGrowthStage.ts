export interface GetGrowthStage {
  id: number;
  code: string;
  name: string;
  monthAgeStart: Date;
  monthAgeEnd: Date;
}

export interface GetGrowthStage2 {
  growthStageId: number;
  growthStageCode: string;
  growthStageName: string;
  description: string;
  createDate: Date;
  monthAgeStart: string;
  monthAgeEnd: string;
}
