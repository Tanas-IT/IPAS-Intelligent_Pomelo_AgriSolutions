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
  cropName: string;
  growthStageName: string;
  masterTypeName: string;
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
}

export interface User {
  userId: number;
  fullName: string;
  avatar: string;
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

interface PlanTargetModel {
  rowIndex: string[];
  landPlotName: string;
  graftedPlantName: string[];
  plantLotName: string[];
  plantName: string[];
  plantTargetId: number;
}
