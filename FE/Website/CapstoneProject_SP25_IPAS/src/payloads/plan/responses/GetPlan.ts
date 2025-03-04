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
  startTime: string;
  endTime: string;
  listReporter: Reporter[];
  listEmployee: Employee[];
  listWorkLog: WorkLog[];
}

export interface Reporter {
  fullName: string;
  avatar: string;
}

export interface Employee {
  fullName: string;
  avatar: string;
}

export interface WorkLog {
  workLogID: number;
  workLogName: string;
  dateWork: string;
  status: string;
  reporter: string;
  avatarOfReporter: string;
}
