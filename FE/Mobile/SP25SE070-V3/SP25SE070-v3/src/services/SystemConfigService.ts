import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetSystemConfig,
  GetSystemConfigGroup,
  GetSystemConfigSelected,
  SystemConfigRequest,
} from "@/payloads";

export const getSystemConfigSelect = async (
  group: string,
  key?: string
): Promise<ApiResponse<GetSystemConfigSelected[]>> => {
  const params = new URLSearchParams({ configGroup: group });
  if (key) params.append("configKey", key);

  const res = await axiosAuth.axiosJsonRequest.get(
    `system-config/for-selected?${params.toString()}`
  );

  return res.data as ApiResponse<GetSystemConfigSelected[]>;
};

export const deleteSystemConfig = async (
  ids: number[] | string[]
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(
    `system-config/${ids[0]}`
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateSystemConfig = async (
  req: SystemConfigRequest
): Promise<ApiResponse<GetSystemConfig>> => {
  const res = await axiosAuth.axiosJsonRequest.put("system-config", req);
  const apiResponse = res.data as ApiResponse<GetSystemConfig>;
  return apiResponse;
};

export const createSystemConfig = async (
  req: SystemConfigRequest
): Promise<ApiResponse<GetSystemConfig>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`system-config`, req);
  const apiResponse = res.data as ApiResponse<GetSystemConfig>;
  return apiResponse;
};

export const getSystemConfigGroupSelect = async (): Promise<
  ApiResponse<GetSystemConfigGroup[]>
> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `system-config/group/for-selected`
  );
  const apiResponse = res.data as ApiResponse<GetSystemConfigGroup[]>;
  return apiResponse;
};
