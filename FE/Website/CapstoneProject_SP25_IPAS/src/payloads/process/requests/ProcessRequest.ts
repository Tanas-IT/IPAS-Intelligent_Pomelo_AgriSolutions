export interface ListPlan {
  PlanId?: number;
  PlanName: string;
  PlanDetail: string;
  PlanNote: string;
  GrowthStageId: number;
  MasterTypeId: number;
  PlanStatus: string;
}

export interface ProcessRequest {
  FarmId: number;
  ProcessName: string;
  MasterTypeId: number;
  GrowthStageId: number;
  IsActive: boolean;
  ListPlan: ListPlan[];
  IsSample: boolean;
  PlanTargetInProcess: number;
}

export interface SubProcess {
  SubProcessId: number;
  SubProcessName: string;
  ParentSubProcessId: number;
  IsDefault: boolean;
  IsActive: boolean;
  MasterTypeId: number;
  GrowthStageId: number;
  Status: string;
  Order: number;
  ListPlan: ListPlan[];
}

export interface UpdateProcessRequest {
  ProcessId: number;
  ProcessName?: string;
  IsActive: boolean;
  IsDefault: boolean;
  IsDeleted: boolean;
  MasterTypeId: number;
  GrowthStageID: number;
  ListUpdateSubProcess: SubProcess[];
  ListPlan: ListPlan[];
}

export interface AIPlanType {
  planId: number;
  planName: string;
  planDetail: string;
  planNote: string;
  growthStageId: number;
  masterTypeId: number;
  planStatus: string;
}

export interface AISubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  isActive: boolean;
  order: number;
  listPlan: AIPlanType[];
}

export interface AIGeneratedProcess {
  processName: string;
  isActive: boolean;
  isSample: boolean;
  masterTypeId: number;
  planTargetInProcess: number;
  listSubProcess: AISubProcess[];
  listPlan: AIPlanType[];
}

export interface AIProcessResponse {
  processDescription: string;
  processGenerate: AIGeneratedProcess;
  success: boolean;
  message: string;
}

export interface AICreateProcessRequest {
  farmId: number;
  processName: string;
  isActive: boolean;
  isSample: boolean;
  masterTypeId: number;
  planTargetInProcess: number;
  listSubProcess: {
    subProcessId: number;
    subProcessName: string;
    parentSubProcessId?: number;
    isActive: boolean;
    order: number;
    listPlan: {
      planName: string;
      planDetail: string;
      planNote: string;
    }[];
  }[];
  listPlan: {
    planName: string;
    planDetail: string;
    planNote: string;
  }[];
}
