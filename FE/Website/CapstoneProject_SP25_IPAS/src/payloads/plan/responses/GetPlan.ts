export interface GetPlan {
  planId: number;
  planName: string;
  status: string;
  planCode: string;
  createDate: Date;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  notes: string;
  planDetail: string;
  frequency: string;
  assignorName: string;
  processName: string;
  cropName: string;
  growthStageName: string;
  isDelete: boolean;
  masterTypeName: string;
  landPlotName: string;
}
