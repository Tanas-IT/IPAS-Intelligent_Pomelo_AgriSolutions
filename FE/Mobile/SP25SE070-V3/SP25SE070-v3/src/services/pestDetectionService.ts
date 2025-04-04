import axiosAuth from "@/api/axiosAuth";
import { ApiResponse } from "@/types/apiBase/responses/ApiResponse";
import { PestDetectionResult, PestReportRequest, PestReportResponse } from "@/types/pestDetection";

export const predictDisease= async (image: File): Promise<ApiResponse<PestDetectionResult[]>> => {
    const res = await axiosAuth.axiosMultipartForm.post('ai/predict-disease-by-file', image);
    const apiResponse = res.data as ApiResponse<PestDetectionResult[]>;
    return apiResponse;
  };

export const createReport = async (data: PestReportRequest): Promise<ApiResponse<PestReportResponse>> => {
    const res = await axiosAuth.axiosMultipartForm.post('report-of-user/create', data);
    const apiResponse = res.data as ApiResponse<PestReportResponse>;
    
    return apiResponse;
  };