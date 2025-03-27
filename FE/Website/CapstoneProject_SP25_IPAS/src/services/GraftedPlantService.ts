import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CreateGraftedPlantsRequest,
  GetData,
  GetGraftedPlant,
  GetGraftedPlantDetail,
  GetGraftedPlantHistory,
  GetGraftedPlantSelected,
  GraftedPlantRequest,
} from "@/payloads";
import { buildParams } from "@/utils";

export const getGraftedPlantSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/get-for-selected/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantSelected[]>;

  return apiResponse;
};

export const getGraftedPlants = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetGraftedPlant>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("grafted-plant", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedPlant>>;
  return apiResponse.data as GetData<GetGraftedPlant>;
};

export const getGraftedPlant = async (id: number): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/${id}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const getGraftedPlantHistory = async (
  plantId: number,
  pageIndex: number,
  GraftedDateFrom?: string,
  GraftedDateTo?: string,
): Promise<ApiResponse<GetData<GetGraftedPlantHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`/grafted-plant/get-by-plant`, {
    params: {
      plantId,
      pageIndex,
      GraftedDateFrom,
      GraftedDateTo,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedPlantHistory>>;
  return apiResponse;
};

export const createGraftedPlants = async (
  req: CreateGraftedPlantsRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`grafted-plant`, req);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteGraftedPlants = async (
  ids: number[] | string[],
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`grafted-plant/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateGraftedPlant = async (
  graftedPlant: GraftedPlantRequest,
): Promise<ApiResponse<GetGraftedPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put("grafted-plant", graftedPlant);
  const apiResponse = res.data as ApiResponse<GetGraftedPlant>;
  return apiResponse;
};

export const updateIsCompletedAndCutting = async (
  graftedPlantId: number,
  plantLotId: number,
): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const formatLotData = {
    graftedPlantId,
    plantLotId,
  };
  const res = await axiosAuth.axiosJsonRequest.put(
    "grafted-plant/completed-and-cutting",
    formatLotData,
  );
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};
