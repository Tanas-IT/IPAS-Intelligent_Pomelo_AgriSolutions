export interface GetGrowthStageSelected {
  id: number;
  code: string;
  name: string;
  monthAgeStart: Date;
  monthAgeEnd: Date;
}

export interface GetGrowthStage {
  growthStageId: number;
  growthStageCode: string;
  growthStageName: string;
  monthAgeStart: string;
  monthAgeEnd: string;
  description: string;
  createDate: Date;
}
