export interface CreateWorklogRequest {
  workLogName: string;
  dateWork: string;
  startTime: string;
  endTime: string;
  planId: number;
  listEmployee: ListEmployee[];
  masterTypeId: number;
}

export interface CreateRedoWorklogRequest {
  failedOrRedoWorkLogId: number;
  newWorkLogName: string;
  newDateWork: string;
  newStartTime: string;
  newEndTime: string;
  newListEmployee: ListEmployee[];
  newAssignorId: number;
}

interface ListEmployee {
  userId: number;
    isReporter: boolean;
}

export interface ListEmployeeAttendance {
  userId: number;
  // status: "Received" | "Rejected";
  status: string;
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

export interface CancelReplacementRequest {
  worklogId: number;
  userId: number;
}