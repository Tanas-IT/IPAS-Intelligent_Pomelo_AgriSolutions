export interface SubProcess {
  subProcessId: number;
  subProcessCode: string;
  subProcessName: string;
  parentSubProcessId?: number;
  isDefault: boolean;
  isActive: boolean;
  createDate: string;
  order: number;
  updateDate: string;
  isDeleted: boolean;
  processId: number;
  listSubProcessData: SubProcess[];
}

export interface PlanType {
  planId: number;
  planName: string;
  planNote: string;
  planDetail: string;
  growthStageId: number;
  masterTypeId: number;
  planStatus: string;
}

export interface GetProcessDetail {
  processId: number;
  processCode: string;
  processName: string;
  isDefault: boolean;
  order: number;
  isActive: boolean;
  createDate: string;
  updateDate: string;
  isDeleted: boolean;
  farmName: string;
  processMasterTypeModel: {
    masterTypeId: number;
    masterTypeName: string;
  },
  processGrowthStageModel: {
    growthStageId: number;
    growthStageName: string;
  },
  subProcesses: SubProcess[];
  listProcessData: any[];
  listPlan: PlanType[];
  isSample: boolean;
}
