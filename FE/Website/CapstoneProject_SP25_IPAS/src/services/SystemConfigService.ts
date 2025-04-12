import { axiosAuth } from "@/api";
import { ApiResponse, GetSystemConfigSelected } from "@/payloads";

export const getSystemConfigSelect = async (
  group: string,
  key?: string,
): Promise<ApiResponse<GetSystemConfigSelected[]>> => {
  const params = new URLSearchParams({ configGroup: group });
  if (key) params.append("configKey", key);

  const res = await axiosAuth.axiosJsonRequest.get(
    `system-config/for-selected?${params.toString()}`,
  );

  return res.data as ApiResponse<GetSystemConfigSelected[]>;
};
