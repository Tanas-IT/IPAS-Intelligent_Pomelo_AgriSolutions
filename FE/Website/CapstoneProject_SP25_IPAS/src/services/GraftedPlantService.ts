import { axiosAuth } from "@/api";
import { ApiResponse, GetGraftedPlantSelected } from "@/payloads";

export const getGraftedPlantSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/get-for-selected/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantSelected[]>;

  return apiResponse;
};