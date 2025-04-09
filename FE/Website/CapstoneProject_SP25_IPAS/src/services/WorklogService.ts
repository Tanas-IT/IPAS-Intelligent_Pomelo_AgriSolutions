import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { CancelReplacementRequest, CreateWorklogRequest, GetAttendanceList, GetEmpListForUpdate, GetWorklog, GetWorklogDetail, GetWorklogNote, ListEmployeeAttendance, UpdateWorklogReq, WorklogStatusResponse } from "@/payloads/worklog";

// export const getWorklog = async () => {
//     const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule");
//     console.log(res);

//     const apiResponse = res.data as ApiResponse<GetWorklog[]>;
//     return apiResponse.data;
// }

export const getWorklog = async (filters: {
  workDateFrom?: string;
  workDateTo?: string;
  growthStage?: string[];
  status?: string[];
  employees?: string[];
  plan?: string[];
  typePlan?: string[];
}) => {
  const params = {
    workDateFrom: filters.workDateFrom,
    workDateTo: filters.workDateTo,
    growthStage: filters.growthStage?.join(","),
    status: filters.status?.join(","),
    employees: filters.employees?.join(","),
    // typePlan: filters.plan?.join(','),
    typePlan: filters.typePlan?.join(","),
  };

  const res = await axiosAuth.axiosJsonRequest.get("work-log/get-all-schedule", { params });
  console.log("result of worklog filter", res);

  const apiResponse = res.data as ApiResponse<GetWorklog[]>;
  return apiResponse.data;
}

export const getWorklogByUserId = async (userId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-schedule?userId=${userId}`);
  const apiResponse = res.data as ApiResponse<GetWorklog[]>;
  return apiResponse;
}

export const getWorklogDetail = async (worklogId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
  const apiResponse = res.data as ApiResponse<GetWorklogDetail>;
  return apiResponse.data;
};

export const addWorklogNote = async (
    note: GetWorklogNote,
  ): Promise<ApiResponse<Object>> => {
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

  export const saveAttendance = async (worklogId: number, listEmployeeCheckAttendance: ListEmployeeAttendance[]): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/check-attendance`, {
      worklogId,
      listEmployeeCheckAttendance
    });
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }

  export const updateWorklog = async (payload: UpdateWorklogReq): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/change-employee`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }

  export const addWorklog = async (payload: CreateWorklogRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.post(`work-log/add-new-worklog`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }

  export const getAttendanceList = async (worklogId: number): Promise<ApiResponse<GetAttendanceList[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-attendance-list?workLogId=${worklogId}`);
    const apiResponse = res.data as ApiResponse<GetAttendanceList[]>;
    return apiResponse;
  }
  export const getEmpListForUpdate = async (worklogId: number): Promise<ApiResponse<GetEmpListForUpdate[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/get-list-employee-to-update?workLogId=${worklogId}`);
    const apiResponse = res.data as ApiResponse<GetEmpListForUpdate[]>;
    return apiResponse;
  }

  export const cancelReplacement = async (payload: CancelReplacementRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/cancel-replacment`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }

  export const canTakeAttendance = async (workLogId: number): Promise<ApiResponse<Object>> => {
    console.log('ảo nữa');
    
    const res = await axiosAuth.axiosJsonRequest.post(`work-log/can-take-attendance`, workLogId);
    console.log("res1111111111111111111111", res);
    
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }

  export const getWorklogStatus = async (): Promise<ApiResponse<WorklogStatusResponse>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/status-work-log-for-manager`);
    return res.data as ApiResponse<WorklogStatusResponse>;
  };
  