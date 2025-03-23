export interface CreateWorklogRequest {
  worklogName: string;
  status: "pending";
  cropId?: string;
  plantPlotId: string;
  processId: string;
  notes?: string;
  date: Date;
  startTime: string;
  endTime: string;
  responsibleBy: string[];
  assignorId: string;
}

export interface ListEmployeeAttendance {
  userId: number;
  status: "Received" | "Rejected";
}

export interface AttendanceRequest {
  worklogId: number;
  listEmployee: ListEmployeeAttendance[];
}

export interface ListEmployeeUpdate {
  oldUserId: number,
  newUserId: number,
  isReporter: boolean,
  status: string
}

export interface UpdateWorklogReq {
  workLogId: number,
  listEmployeeUpdate: ListEmployeeUpdate[],
  dateWork: string,
  startTime: string,
  endTime: string,
}