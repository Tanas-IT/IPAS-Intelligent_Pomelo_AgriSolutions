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
  avatar: string;
}

export interface PlanTargetModel {
  rowIndex: number[];
  landPlotName: string;
  graftedPlantName: string[];
  plantLotName: string[];
  plantName: string[];
  plantTargetId: number;
}

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
}

export interface GetWorklogNote {
  userWorklogId: string;
  notes: string;
  issue: string;
  userId: string;
  Resources: Resource[];
}


