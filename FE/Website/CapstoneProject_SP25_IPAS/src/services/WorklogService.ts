import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import {
  CancelReplacementRequest,
  CreateRedoWorklogRequest,
  CreateWorklogRequest,
  DependencyWorklog,
  EmployeeWithSkills,
  GetAttendanceList,
  GetEmpListForUpdate,
  GetWorklog,
  GetWorklogDetail,
  GetWorklogNote,
  ListEmployeeAttendance,
  UpdateStatusWorklogRequest,
  UpdateWorklogReq,
  WorklogStatusResponse,
} from "@/payloads/worklog";
import { buildParams } from "@/utils";

// export const getWorklog = async () => {
//     const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule");
//     console.log(res);

//     const apiResponse = res.data as ApiResponse<GetWorklog[]>;
//     return apiResponse.data;
// }

export const getWorklog = async (additionalParams?: Record<string, any>) => {
  const params = buildParams(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    additionalParams,
  );

  const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule", { params });
  const apiResponse = res.data as ApiResponse<GetWorklog[]>;
  return apiResponse.data;
};

export const getWorklogByUserId = async (userId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-schedule?userId=${userId}`);
  const apiResponse = res.data as ApiResponse<GetWorklog[]>;
  return apiResponse;
};

export const getWorklogDetail = async (worklogId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
  const apiResponse = res.data as ApiResponse<GetWorklogDetail>;
  return apiResponse.data;
};

export const addWorklogNote = async (note: GetWorklogNote): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("UserId", note.userId);
  formData.append("WorkLogId", note.userWorklogId);
  formData.append("Note", note.notes);
  formData.append("Issue", note.issue);

  if (note.Resources && note.Resources.length > 0) {
    note.Resources.forEach((fileResource, index) => {
      formData.append(`Resources[${index}].resourceURL`, fileResource.resourceURL);
    });
  }

  const res = await axiosAuth.axiosMultipartForm.post(`work-log/take-note`, formData);
  return res.data as ApiResponse<Object>;
};

export const saveAttendance = async (
  worklogId: number,
  listEmployeeCheckAttendance: ListEmployeeAttendance[],
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`work-log/check-attendance`, {
    worklogId,
    listEmployeeCheckAttendance,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateWorklog = async (payload: UpdateWorklogReq): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`work-log/change-employee`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const addWorklog = async (payload: CreateWorklogRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`work-log/add-new-worklog`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const addRedoWorklog = async (
  payload: CreateRedoWorklogRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`work-log/redo-work-log`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getAttendanceList = async (
  worklogId: number,
): Promise<ApiResponse<GetAttendanceList[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `work-log/get-attendance-list?workLogId=${worklogId}`,
  );
  const apiResponse = res.data as ApiResponse<GetAttendanceList[]>;
  return apiResponse;
};
export const getEmpListForUpdate = async (
  worklogId: number,
): Promise<ApiResponse<GetEmpListForUpdate[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `work-log/get-list-employee-to-update?workLogId=${worklogId}`,
  );
  const apiResponse = res.data as ApiResponse<GetEmpListForUpdate[]>;
  return apiResponse;
};

export const cancelReplacement = async (
  payload: CancelReplacementRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`work-log/cancel-replacment`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const canTakeAttendance = async (workLogId: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`work-log/can-take-attendance`, { workLogId });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getWorklogStatus = async (): Promise<ApiResponse<WorklogStatusResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/status-work-log-for-manager`);
  return res.data as ApiResponse<WorklogStatusResponse>;
};

export const getDependencyWorklog = async (
  worklogId: number,
): Promise<ApiResponse<DependencyWorklog[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-dependency-worklog/${worklogId}`);
  return res.data as ApiResponse<DependencyWorklog[]>;
};

export const getEmployeesByWorkSkill = async (
  farmId: number,
  workTypeId?: number,
): Promise<ApiResponse<EmployeeWithSkills[]>> => {
  const params = new URLSearchParams({ farmId: farmId.toString() });

  if (workTypeId !== undefined && workTypeId !== null) {
    params.append("workTypeId", workTypeId.toString());
  }

  const res = await axiosAuth.axiosJsonRequest.get(`work-log/filter-employee?${params.toString()}`);

  return res.data as ApiResponse<EmployeeWithSkills[]>;
};

export const getEmployeesByWorkTargetSkill = async (
  target: string,
): Promise<ApiResponse<EmployeeWithSkills[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `work-log/filter-employee-target?target=${target}`,
  );
  return res.data as ApiResponse<EmployeeWithSkills[]>;
};

export const updateStatusWorklog = async (
  payload: UpdateStatusWorklogRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`work-log/update-status-of-workLog`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteWorklog = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`work-log/${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
