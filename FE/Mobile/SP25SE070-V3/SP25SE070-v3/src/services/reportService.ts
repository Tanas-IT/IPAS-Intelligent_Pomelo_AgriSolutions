import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { ReportResponse } from "@/types";

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
