import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlantLot, GetPlantLot2, PlantLotRequest } from "@/payloads";
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

export const deleteLots = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plant-lots/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateLot = async (lot: PlantLotRequest): Promise<ApiResponse<GetPlantLot2>> => {
  // const formatLotData: any = {
  //   plantLotID: lot.partnerId,
  //   partnerID: lot.partnerId,
  //   name: lot.plantLotName,
  //   previousQuantity: lot.goodPlant,
  //   unit: lot.unit,
  //   note: lot.note,
  // };
  const res = await axiosAuth.axiosJsonRequest.put("update-plantLot-info", lot);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const createLot = async (lot: PlantLotRequest): Promise<ApiResponse<GetPlantLot2>> => {
  const formatLotData: any = {
    partnerID: lot.partnerId,
    name: lot.plantLotName,
    importedQuantity: lot.previousQuantity,
    unit: lot.unit,
    note: lot.note,
  };
  const res = await axiosAuth.axiosJsonRequest.post(`plant-lots`, formatLotData);
  const apiResponse = res.data as ApiResponse<GetPlantLot2>;
  return apiResponse;
};

export const getPlantLotSelected = async (): Promise<ApiResponse<GetPlantLot[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`get-for-selected`);
  const apiResponse = res.data as ApiResponse<GetPlantLot[]>;
  return apiResponse;
};
