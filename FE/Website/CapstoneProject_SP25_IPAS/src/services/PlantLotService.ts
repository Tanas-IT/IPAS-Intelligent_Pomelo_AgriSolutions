import { axiosAuth } from "@/api";
import { ApiResponse, GetPlantLot } from "@/payloads";

export const getPlantLotSelected = async (): Promise<ApiResponse<GetPlantLot[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`get-for-selected`);
  const apiResponse = res.data as ApiResponse<GetPlantLot[]>;
  return apiResponse;
}