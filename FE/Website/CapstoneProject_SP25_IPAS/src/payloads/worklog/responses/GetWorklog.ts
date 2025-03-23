import { PlanTargetModel } from "@/payloads/plan";

export interface User {
  userId: number;
  fullName: string;
  isReporter: boolean;
}

export interface GetWorklog {
  workLogId: number;
  workLogName: string;
  workLogCode: string;
  date: string;
  status: string;
  scheduleId: number;
  startTime: string;
  endTime: string;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  users: User[];
}

// export interface GetWorklog {
//   list: WorkLog[];
//   totalPage: number;
//   totalRecord: number;
// }

export interface User {
  fullName: string;
  avatarURL: string;
  isReporter: boolean;
  status: string;
}

interface PlantModel {
  plantId: number;
  plantName: string;
}

interface RowModel {
  landRowId: number;
  rowIndex: number;
  plants: PlantModel[]
}

// export interface PlanTargetModel {
//   unit?: string;
//   landPlotId?: number;
//   rows: RowModel[];
//   landPlotName: string;
//   graftedPlants: any[];
//   plantLots: any[];
//   plants: PlantModel[];
// }

export interface TaskFeedback {
  taskFeedbackId: number;
  taskFeedbackCode: string;
  content: string;
  createDate: string;
  workLogId: number;
  managerId: number;
  workLogName: string;
  reason?: string;
}

export interface Resource {
  resourceID: number;
  resourceCode: string;
  resourceURL: string;
}

export interface NoteOfWorkLog {
  issue: string;
  notes: string;
  fullName: string;
  avatarURL: string;
  userId: number;
  listResources: Resource[];
}

export interface GetWorklogDetail {
  workLogId: number;
  workLogCode: string;
  status: string;
  workLogName: string;
  date: string;
  actualStartTime: string;
  actualEndTime: string;
  isConfirm: boolean;
  listEmployee: User[];
  reporter: User[];
  planTargetModels: PlanTargetModel[];
  listGrowthStageName: string[];
  listTaskFeedback: TaskFeedback[];
  listNoteOfWorkLog: NoteOfWorkLog[];
  processName: string;
  masterTypeName: string;
  cropName: string;
  replacementEmployees: ReplacementEmployee[];
}

export interface ReplacementEmployee {
  userId: number; //nhân viên được thay thế
  replacedUserId: number; //người thay thế
}

export interface GetWorklogNote {
  userWorklogId: string;
  notes: string;
  issue: string;
  userId: string;
  Resources: Resource[];
}
