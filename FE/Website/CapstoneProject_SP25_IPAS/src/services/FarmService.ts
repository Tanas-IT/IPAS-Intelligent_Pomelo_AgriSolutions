import { axiosAuth } from "@/api";
import { ApiResponse, GetFarm, GetFarmPicker } from "@/payloads";
import { getUserId } from "@/utils";

export const getFarmsOfUser = async (): Promise<ApiResponse<GetFarmPicker[]>> => {
  const userId = getUserId();
  const res = await axiosAuth.axiosJsonRequest.get(`farms/get-farm-of-user/${userId}`);
  const apiResponse = res.data as ApiResponse<GetFarmPicker[]>;
  return apiResponse;
};

export const getFarm = async (farmId: string): Promise<ApiResponse<GetFarm>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`farms/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetFarm>;
  return apiResponse;
};
