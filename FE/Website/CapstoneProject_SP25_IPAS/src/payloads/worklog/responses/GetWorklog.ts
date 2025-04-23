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
  statusOfUserWorkLog: string | null;
  userId: number;
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
  status?: string;
  avatarURL: string;
  fullName: string;
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
  masterTypeId: number;
  cropName: string;
  replacementEmployee: ReplacementEmployee[];
  planId: number;
  planName: string;
  processId: number;
  isHarvest: boolean;
  isTakeAttendance: boolean;
  redoWorkLog: RedoWorkLog;
  assignorName: string;
  endDate: string;
  startDate: string;
}

interface RedoWorkLog {
  workLogId: number
  status: string
  workLogName: string
  date: string
}

export interface ReplacementEmployee {
  userId: number; //nhân viên được thay thế
  replaceUserId: number; //người thay thế
  fullName?: string;
  avatar?: string;
  replaceUserFullName?: string;
  replaceUserAvatar?: string;
  replaceUserIsRepoter?: boolean
}

export interface GetWorklogNote {
  userWorklogId: string;
  notes: string;
  issue: string;
  userId: string;
  Resources: Resource[];
}

export interface GetAttendanceList {
  userWorkLogId: number;
  userId: number;
  avatarURL: string;
  fullName: string;
  isReporter: boolean;
}

export interface GetEmpListForUpdate {
  userWorkLogId: number;
  userId: number;
  avatarURL: string;
  fullName: string;
  isReporter: boolean;
  statusOfUser: string;
}

export interface WorklogStatusResponse {
  status: string[];
}

export interface DependencyWorklog {
  workLogId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  order: string;
  date: string;
}

export interface Worklog {
  workLogId: number;
  workLogName: string;
  startTime: string;
  endTime: string;
  status: string;
  date: string;
}

// Interface cho Plan (chứa danh sách Worklogs)
export interface DependencyWorklog {
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  workLogs: Worklog[];
}

export interface SkillWithScore {
  skillName: string;
  score: number;
}

export interface EmployeeWithSkills {
  userId: number;
  fullName: string;
  avatarURL: string;
  skillWithScore: SkillWithScore[];
}