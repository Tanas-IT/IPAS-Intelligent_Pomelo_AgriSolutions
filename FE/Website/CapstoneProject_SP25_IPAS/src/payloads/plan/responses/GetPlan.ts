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
  listLandPlotOfCrop: ListLandPlotOfCrop[]
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
  rows: RowModel[];
  landPlotName: string;
  graftedPlants: any[];
  plantLots: any[];
  plants: PlantModel[];
}
