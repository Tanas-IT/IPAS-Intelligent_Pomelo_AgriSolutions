import { axiosAuth } from "@/api";
import { ApiResponse, CreateFeedbackRequest } from "@/payloads";

export const createFeedback = async (
  feedback: CreateFeedbackRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`task-feedback`, feedback);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateFeedback = async (
  feedback: CreateFeedbackRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`task-feedback`, feedback);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteFeedback = async (
  feedbackId: number,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`task-feedback/${feedbackId}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};