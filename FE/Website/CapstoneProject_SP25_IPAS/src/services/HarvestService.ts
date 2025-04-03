import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetHarvestDay,
  GetHarvestDayDetail,
  GetHarvestSelected,
  GetHarvestStatisticOfPlant,
  GetHarvestStatisticPlants,
  HarvestRequest,
  HarvestStatisticInYearRequest,
  HarvestStatisticOfPlantRequest,
  RecordHarvestRequest,
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

export const getHarvest = async (id: number): Promise<ApiResponse<GetHarvestDayDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`harvests/${id}`);
  const apiResponse = res.data as ApiResponse<GetHarvestDayDetail>;
  return apiResponse;
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
    startTime: harvest.startTime,
    endTime: harvest.endTime,
  };
  const res = await axiosAuth.axiosJsonRequest.put("harvests", payload);
  const apiResponse = res.data as ApiResponse<GetHarvestDay>;
  return apiResponse;
};

export const createHarvest = async (
  harvest: HarvestRequest,
): Promise<ApiResponse<GetHarvestDay>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`harvests`, harvest);
  const apiResponse = res.data as ApiResponse<GetHarvestDay>;
  return apiResponse;
};

export const getProductInHarvest = async (
  id: number,
): Promise<ApiResponse<GetHarvestSelected[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `harvests/for-selected/product-in-harvest?harvestId=${id}`,
  );
  const apiResponse = res.data as ApiResponse<GetHarvestSelected[]>;
  return apiResponse;
};

export const createRecordHarvest = async (
  record: RecordHarvestRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`harvests/plants/record`, record);
  const apiResponse = res.data as ApiResponse<Object>;
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
