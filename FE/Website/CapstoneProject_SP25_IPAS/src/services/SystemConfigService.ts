import { axiosAuth } from "@/api";
import { ApiResponse, GetSystemConfigSelected } from "@/payloads";

export const getSystemConfigSelect = async (
  key: string,
): Promise<ApiResponse<GetSystemConfigSelected[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`system-config/for-selected?configKey=${key}`);
  const apiResponse = res.data as ApiResponse<GetSystemConfigSelected[]>;
  return apiResponse;
};
