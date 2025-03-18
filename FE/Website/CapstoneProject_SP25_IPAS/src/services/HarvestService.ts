import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetHarvestStatisticOfPlant,
  GetHarvestStatisticPlants,
  HarvestStatisticInYearRequest,
  HarvestStatisticOfPlantRequest,
} from "@/payloads";

export const getHarvestStatisticOfPlant = async (
  req: HarvestStatisticOfPlantRequest,
): Promise<ApiResponse<GetHarvestStatisticOfPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`harvests/statistic/plant-in-year`, {
    params: req,
  });
  const apiResponse = res.data as ApiResponse<GetHarvestStatisticOfPlant>;
  return apiResponse;
};

export const getHarvestStatisticInYear = async (
  req: HarvestStatisticInYearRequest,
): Promise<ApiResponse<GetHarvestStatisticPlants[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`harvests/statistic/top-in-year`, {
    params: req,
  });
  const apiResponse = res.data as ApiResponse<GetHarvestStatisticPlants[]>;
  return apiResponse;
};
