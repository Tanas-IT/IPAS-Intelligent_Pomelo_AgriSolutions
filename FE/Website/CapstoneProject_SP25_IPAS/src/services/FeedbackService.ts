import { axiosAuth } from "@/api";
import { ApiResponse, CreateFeedbackRequest } from "@/payloads";

export const createFeedback = async (
  feedback: CreateFeedbackRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`task-feedback`, feedback);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};