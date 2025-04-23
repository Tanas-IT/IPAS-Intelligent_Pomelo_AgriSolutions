export interface GetPlan {
  planId: number;
  planName: string;
  planCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes: string;
  status: string;
  planDetail: string;
  progress: number;
  isDelete: boolean;
  assignorName: string;
  processName: string;
  processId: number;
  cropName: string;
  cropId: number;
  growthStages: GrowthStages[];
  masterTypeName: string;
  masterTypeId: number;
  avatarOfAssignor: string;
  plantNames: string[];
  landPlotNames: string[];
  plantLotNames: string[];
  rowIndexs: number[];
  dayOfWeek: number[];
  dayOfMonth: string;
  customDates: string;
  startTime: string;
  endTime: string;
  listReporter: User[];
  listEmployee: User[];
  listWorkLog: WorkLog[];
  createDate: string;
  frequency: string;
  planTargetModels: PlanTargetModel[];
  graftedPlantName: string[];
  maxVolume: number;
  minVolume: number;
  pesticideName: string;
  listLandPlotOfCrop: ListLandPlotOfCrop[];
  hasNonSampleProcess: boolean;
}

interface ListLandPlotOfCrop {
  id: number;
  code: string;
  name: string;
}

interface GrowthStages {
  id: number;
  name: string;
}

export interface User {
  userId: number;
  fullName: string;
  avatarURL: string;
  skillWithScore: {
    skillName: string;
    score: number;
  }[];
}

export interface WorkLog {
  workLogID: number;
  workLogName: string;
  dateWork: string;
  status: string;
  reporter: string;
  actualStartTime: string;
  actualEndTime: string;
  avatarOfReporter: string;
}

// interface PlanTargetModel {
//   rowIndex: string[];
//   landPlotName: string;
//   graftedPlantName: string[];
//   plantLotName: string[];
//   plantName: string[];
//   plantTargetId: number;
// }

interface PlantModel {
  plantId: number;
  plantName: string;
}

interface RowModel {
  landRowId: number;
  rowIndex: number;
  plants: PlantModel[]
}

export interface PlanTargetModel {
  unit?: string;
  landPlotId?: number;
  rows: RowModel[];
  landPlotName: string;
  graftedPlants: any[];
  plantLots: any[];
  plants: PlantModel[];
}

export interface PlanTarget {
  type: "Plot" | "Row" | "Plant" | "Plant Lot" | "Grafted Plant";
  plotNames?: string[];
  rowNames?: string[];
  plantNames?: string[];
  plantLotNames?: string[];
  graftedPlantNames?: string[];
}

export interface GetPlanSelect {
  id: number;
  code: string;
  name: string;
}

export interface Plan {
  planId: number;
  planName: string;
  planDetail?: string;
  planNote?: string;
}

export interface SubProcess {
  subProcessID: number;
  subProcessName: string;
  order: number;
  plans: Plan[];
  children: SubProcess[];
}

export interface ProcessResponse {
  processId: number;
  processName: string;
  plans: Plan[];
  subProcesses: SubProcess[];
}

export interface PlanNode {
  key: string;
  type: "plan";
  name: string;
  planId: number;
  planName: string;
  planDetail: string;
  planNote: string;
  masterTypeId: number;
  listEmployee: any[];
  schedule: any;
}

export interface SubProcessNode {
  key: string;
  type: "subProcess";
  name: string;
  subProcessId: number;
  subProcessOrder: number | null;
  children: (SubProcessNode | PlanNode)[];
}

export interface ProcessNode {
  key: string;
  type: "process";
  name: string;
  children: (SubProcessNode | PlanNode)[];
}

export type DataSourceNode = ProcessNode | SubProcessNode | PlanNode;

export interface PlanNodes {
  planId: number;
  planName: string;
  startDate?: string;
  endDate?: string;
  isSelected: boolean;
}

export interface SubProcessNodes {
  subProcessID: number;
  subProcessName: string;
  order: number;
  plans: PlanNodes[];
  children: SubProcessNodes[];
}

export interface ProcessByPlanResponse {
  processId: number;
  processName: string;
  plans: PlanNodes[];
  subProcesses: SubProcessNodes[];
}