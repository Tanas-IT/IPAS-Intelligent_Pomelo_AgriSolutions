import { axiosAuth } from "@/api";
import { CRITERIA_TARGETS } from "@/constants";
import {
  ApiResponse,
  GetData,
  GetPlantLot,
  GetPlantLot2,
  GetPlantLotDetail,
  PlantLotRequest,
} from "@/payloads";
import { buildParams } from "@/utils";

export const getPlantLots = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlantLot2>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("plantLots", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetPlantLot2>>;
  return apiResponse.data as GetData<GetPlantLot2>;
};

export const getPlantLot = async (id: number): Promise<ApiResponse<GetPlantLotDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`get-plantLot-by-id/${id}`);
  const apiResponse = res.data as ApiResponse<GetPlantLotDetail>;
  return apiResponse;
};

export const deleteLots = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plant-lots/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateLot = async (lot: PlantLotRequest): Promise<ApiResponse<GetPlantLot2>> => {
  const formatLotData = {
    plantLotID: lot.plantLotId,
    partnerID: lot.partnerId,
    name: lot.plantLotName,
    lastQuantity: lot.lastQuantity,
    masterTypeId: lot.masterTypeId,
    unit: lot.unit,
    note: lot.note,
  };

  const res = await axiosAuth.axiosJsonRequest.put("plant-lots", formatLotData);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const updateQuantityLot = async (
  lotId: number,
  target: string,
  quantity: number,
): Promise<ApiResponse<GetPlantLot2>> => {
  const formatLotData = {
    plantLotID: lotId,
    ...(target === CRITERIA_TARGETS["Plantlot Evaluation"]
      ? { lastQuantity: quantity }
      : { inputQuantity: quantity }),
  };
  const res = await axiosAuth.axiosJsonRequest.put("plant-lots", formatLotData);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const updateIsCompletedLot = async (
  lotId: number,
  isCompleted: boolean,
): Promise<ApiResponse<GetPlantLot2>> => {
  const formatLotData = {
    plantLotID: lotId,
    isPass: isCompleted,
  };
  const res = await axiosAuth.axiosJsonRequest.put("plant-lots", formatLotData);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const createLot = async (lot: PlantLotRequest): Promise<ApiResponse<GetPlantLot2>> => {
  const formatLotData = {
    partnerID: lot.partnerId,
    name: lot.plantLotName,
    importedQuantity: lot.previousQuantity,
    masterTypeId: lot.masterTypeId,
    unit: lot.unit,
    note: lot.note,
  };
  const res = await axiosAuth.axiosJsonRequest.post(`plant-lots`, formatLotData);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const createAdditionalLot = async (
  lotIdParent: number,
  importQuantity: number,
): Promise<ApiResponse<Object>> => {
  const formatLotData = {
    mainPlantLotId: lotIdParent,
    importedQuantity: importQuantity,
  };
  const res = await axiosAuth.axiosJsonRequest.post(`plant-lots/additional`, formatLotData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getPlantLotSelected = async (): Promise<ApiResponse<GetPlantLot[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`get-for-selected`);
  const apiResponse = res.data as ApiResponse<GetPlantLot[]>;
  return apiResponse;
};

export const fillPlantToPlot = async (
  landPlotId: number,
  plantLotId: number,
  growthStageId: number,
): Promise<ApiResponse<GetPlantLotDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`fill-plant-to-plot`, {
    landPlotId,
    plantLotId,
    growthStageId,
  });
  const apiResponse = res.data as ApiResponse<GetPlantLotDetail>;
  return apiResponse;
};
