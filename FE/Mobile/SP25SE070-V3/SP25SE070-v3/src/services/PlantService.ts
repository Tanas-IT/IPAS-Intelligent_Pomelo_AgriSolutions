import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetPlantDetail,
  GetPlantGrowthHistory,
} from "@/payloads";

export const getPlant = async (
  plantId: number
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const getPlantGrowthHistory = async (
  plantId: number,
  pageSize: number,
  pageIndex: number,
  createFrom?: string,
  createTo?: string
): Promise<ApiResponse<GetData<GetPlantGrowthHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    "plant-growth-history/pagin",
    {
      params: {
        plantId,
        pageSize,
        pageIndex,
        createFrom,
        createTo,
      },
    }
  );
  const apiResponse = res.data as ApiResponse<GetData<GetPlantGrowthHistory>>;
  return apiResponse;
};
