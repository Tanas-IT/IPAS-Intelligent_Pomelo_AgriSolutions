import axiosAuth from "@/api/axiosAuth";
import { ApiResponse } from "@/payloads/ApiBase/ApiResponse";
import { PestDetectionResult, PestReportRequest, PestReportResponse } from "@/types/pestDetection";

// export const predictDisease = async (image: File): Promise<ApiResponse<PestDetectionResult[]>> => {
//   const formData = new FormData();
//   formData.append("image", image);
//   const res = await axiosAuth.axiosMultipartForm.post('ai/predict-disease-by-file', formData);
//   const apiResponse = res.data as ApiResponse<PestDetectionResult[]>;
//   return apiResponse;
// };

export const predictDisease = async (formData: FormData): Promise<ApiResponse<PestDetectionResult[]>> => {
  const res = await axiosAuth.axiosMultipartNoErrorHandler.post('ai/predict-disease-by-file', formData);
  const apiResponse = res.data as ApiResponse<PestDetectionResult[]>;
  return apiResponse;
};

export const createReport = async (data: PestReportRequest): Promise<ApiResponse<PestReportResponse>> => {
  const res = await axiosAuth.axiosMultipartForm.post('report-of-user/create', data);
  const apiResponse = res.data as ApiResponse<PestReportResponse>;

  return apiResponse;
};

export const predictDiseaseByUrl = async (imageURL: string): Promise<ApiResponse<PestDetectionResult[]>> => {
  const res = await axiosAuth.axiosJsonNoErrorHandler.post('ai/predict-disease-by-url', { imageURL });
  const apiResponse = res.data as ApiResponse<PestDetectionResult[]>;
  return apiResponse;
};