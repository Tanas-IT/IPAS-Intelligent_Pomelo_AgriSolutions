import { axiosAuth } from "@/api";
import { ApiResponse, GetLandRow, GetPlantSelect } from "@/payloads";
import { getFarmId } from "@/utils";

export const getPlants = async (landRowId: number): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-plant-of-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};
