export interface User {
  userId: number;
  fullName: string;
  isReporter: boolean;
}

export interface WorkLog {
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

export interface GetWorklog {
  list: WorkLog[];
  totalPage: number;
  totalRecord: number;
}
