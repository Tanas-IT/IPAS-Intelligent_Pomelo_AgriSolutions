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
  resources?: ResourceItem[];
}
