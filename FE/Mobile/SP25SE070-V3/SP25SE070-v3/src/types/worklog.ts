export type StatusType = 'notStarted' | 'inProgress' | 'overdue' | 'reviewing' | 'done' | 'redo' | 'onRedo' | 'cancelled';

export interface User {
  userId: number;
  fullName: string;
  isReporter: boolean;
  avatarURL: string;
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

export interface ResourceItem {
  resourceID: number;
  description: string;
  resourceURL: string;
  fileFormat: string;
  file: string;
}

export interface WorklogNoteFormData {
  userId?: number;
  workLogId?: number;
  note: string;
  issue?: string;
  // resources?: ResourceItem[];
  resources?: { uri: string; type: string; name: string }[];
}

export interface GetWorklogByStatus {
  worklogId: number;
  worklogName: string;
  date: string;
  time: string;
  status: StatusType;
  avatarEmployees: string[]
}

interface UserWorklogDetail {
  userId: number;
  fullName: string;
  avatarURL: string;
  statusOfUserWorkLog: string
}

interface ListNoteOfWorkLog {
  userWorklogId: number;
  notes: string;
  fullName: string;
  avatarURL: string;
  issue: string;
  userId: number;
  listResources: any[];
}

interface ReplacementEmployee {
  userId: number;
  fullName: string;
  avatar: string;
  replaceUserId: number;
  replaceUserFullName: string;
  replaceUserAvatar: string;
}

export interface WorklogDetail {
  workLogId: number;
  workLogCode: string;
  status: string;
  workLogName: string;
  planName: string;
  processName: string;
  masterTypeName: string;
  date: string;
  actualStartTime: string;
  actualEndTime: string;
  isConfirm: boolean;
  listEmployee: UserWorklogDetail[];
  reporter: UserWorklogDetail[];
  planTargetModels: { landPlotId: number; landPlotName: string }[];
  typeWork: string;
  listGrowthStageName: string[];
  listTaskFeedback: any[];
  listNoteOfWorkLog: ListNoteOfWorkLog[];
  replacementEmployee: ReplacementEmployee[];
  processId: number;
  isHarvest: boolean;
  isTakeAttendance: boolean;
  redoWorkLog: RedoWorkLog;
}

interface RedoWorkLog {
  workLogId: number
  status: string
  workLogName: string
  date: string
}

export interface CancelWorklogRequest {
  workLogId: number
  userId: number
}

export interface UpdateStatusWorklogRequest {
  workLogId: number
  status?: string
  startTime?: string
  endTime?: string
  dateWork?: string
  userId?: number
}
