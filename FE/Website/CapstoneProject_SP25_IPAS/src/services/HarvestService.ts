import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetHarvestDay,
  GetHarvestStatisticOfPlant,
  GetHarvestStatisticPlants,
  HarvestRequest,
  HarvestStatisticInYearRequest,
  HarvestStatisticOfPlantRequest,
} from "@/payloads";
import { buildParams } from "@/utils";

export const getHarvests = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  cropId?: number,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetHarvestDay>> => {
  const params = buildParams(currentPage, rowsPerPage, sortField, sortDirection, searchValue, {
    cropId: cropId,
    ...additionalParams,
  });

  const res = await axiosAuth.axiosJsonRequest.get("harvests", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetHarvestDay>>;
  return apiResponse.data as GetData<GetHarvestDay>;
};

export const deleteHarvest = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const harvestIds = ids;
  const res = await axiosAuth.axiosJsonRequest.put(
    `harvests/softed-delete?harvestIds=${harvestIds[0]}`,
    harvestIds,
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateHarvest = async (
  harvest: HarvestRequest,
): Promise<ApiResponse<GetHarvestDay>> => {
  const payload = {
    harvestHistoryId: harvest.harvestHistoryId,
    dateHarvest: harvest.dateHarvest,
    harvestHistoryNote: harvest.harvestHistoryNote,
    totalPrice: harvest.totalPrice,
  };
  const res = await axiosAuth.axiosJsonRequest.put("harvests", payload);
  const apiResponse = res.data as ApiResponse<GetHarvestDay>;
  return apiResponse;
};

export const createHarvest = async (
  harvest: HarvestRequest,
): Promise<ApiResponse<GetHarvestDay>> => {
  console.log(harvest);

  const res = await axiosAuth.axiosJsonRequest.post(`harvests`, harvest);
  const apiResponse = res.data as ApiResponse<GetHarvestDay>;
  return apiResponse;
};

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
