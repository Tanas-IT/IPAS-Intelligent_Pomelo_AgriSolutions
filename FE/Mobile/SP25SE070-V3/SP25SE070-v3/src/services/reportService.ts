import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { EmployeeProductivityResponse, ReportResponse, TodayTaskResponse } from "@/types";

interface ReportFilterParams {
    userId: number;
    search?: string;
    sortBy?: string;
    direction?: "asc" | "desc";
    isTrainned?: boolean;
    isUnanswered?: boolean;
  }
export const getReportsOfUser = async (
    params: ReportFilterParams
  ): Promise<ApiResponse<ReportResponse[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get(
      `/report-of-user/get-report-of-user`,
      { params }
    );
    const apiResponse = res.data as ApiResponse<ReportResponse[]>;
    return apiResponse;
  };

  export const getTodayTaskEmployee = async (
    userId: number
  ): Promise<ApiResponse<TodayTaskResponse[]>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`/report/employee/todays-tasks?userId=${userId}`);
    const apiResponse = res.data as ApiResponse<TodayTaskResponse[]>;
    return apiResponse;
  };

  export const getEmployeeProductivity = async (
    userId: number,
    timeRange: string = "week"
  ): Promise<ApiResponse<EmployeeProductivityResponse>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`/report/employee/productivity?userId=${userId}&timeRange=${timeRange}`);
    const apiResponse = res.data as ApiResponse<EmployeeProductivityResponse>;
    return apiResponse;
  };
