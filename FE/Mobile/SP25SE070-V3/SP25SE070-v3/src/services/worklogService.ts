import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { CancelWorklogRequest, GetWorklog, WorklogDetail } from "@/types";

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
    return apiResponse.data;
  }
  
  export const getWorklogDetail = async (worklogId: number) => {
    const res = await axiosAuth.axiosJsonRequest.get(`work-log/detail/${worklogId}`);
    const apiResponse = res.data as ApiResponse<WorklogDetail>;
    return apiResponse.data;
  };

  export const cancelWorklog = async (payload: CancelWorklogRequest): Promise<ApiResponse<Object>> => {
    const res = await axiosAuth.axiosJsonRequest.put(`work-log/cancelled-workLog`, payload);
    const apiResponse = res.data as ApiResponse<Object>;
    return apiResponse;
  }