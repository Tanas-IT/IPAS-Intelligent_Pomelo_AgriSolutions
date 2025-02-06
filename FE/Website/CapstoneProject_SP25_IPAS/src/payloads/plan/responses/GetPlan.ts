export interface GetPlan {
  planId: number;
  status: string;
  planCode: string;
  createDate: Date;
  startDate: Date;
  endDate: Date;
  updateDate: Date;
  isActive: boolean;
  notes: string;
  planDetail: string;
  responsibleBy: string;
  frequency: string;
  plantId: number;
  landPlotId: number;
  assignorId: number;
  pesticideName: string;
  maxVolume: number;
  minVolume: number;
  processId: number;
  cropId: number;
  growthStageId: number;
  plantLotId: number;
  isDelete: boolean;
  masterTypeId: number;
  farmId: string;
}
