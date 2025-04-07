import { axiosAuth } from "@/api";
import { ApiResponse, GetFarmInfo, GetFarmPicker } from "@/payloads";

export const getFarmsOfUser = async (
  userId: string
): Promise<ApiResponse<GetFarmPicker[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `farms/get-farm-of-user/${userId}`
  );
  const apiResponse = res.data as ApiResponse<GetFarmPicker[]>;
  return apiResponse;
};

export const getFarm = async (
  farmId: string
): Promise<ApiResponse<GetFarmInfo>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`farms/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetFarmInfo>;
  return apiResponse;
};
