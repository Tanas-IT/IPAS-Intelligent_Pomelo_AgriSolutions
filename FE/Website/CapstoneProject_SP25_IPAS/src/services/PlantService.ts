import { axiosAuth } from "@/api";
import { GROWTH_ACTIONS } from "@/constants";
import {
  ApiResponse,
  GetData,
  GetPlant,
  GetPlantDetail,
  GetPlantOfRowSelect,
  GetPlantSelect,
  PlantRequest,
} from "@/payloads";
import { buildParams } from "@/utils";

export const getPlants = async (landRowId: number): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-plant-of-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};

export const getPlantList = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlant>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("plants/get-plants-pagin", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetPlant>>;
  return apiResponse.data as GetData<GetPlant>;
};

export const getPlant = async (plantId: number): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const deletePlants = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plants/soft-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePlant = async (plant: PlantRequest): Promise<ApiResponse<GetPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put("plants", plant);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const createPlant = async (plant: PlantRequest): Promise<ApiResponse<GetPlant>> => {
  const formData = new FormData();
  Object.entries(plant).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      const fieldName = key === "plantReferenceId" ? "MotherPlantId" : key;
      formData.append(fieldName, value instanceof File ? value : value.toString());
    }
  });

  const res = await axiosAuth.axiosMultipartForm.post(`plants`, formData);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const importPlants = async (file: File): Promise<ApiResponse<GetPlant>> => {
  const formData = new FormData();
  formData.append("fileExcel", file);
  formData.append("skipDuplicate", "false");

  const res = await axiosAuth.axiosMultipartForm.post(`plants/import-excel`, formData);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const getMotherPlantSelect = async (): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `plants/get-for-selected/growth-stage-function?activeFunction=${GROWTH_ACTIONS.GRAFTED}`,
  );
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};

export const getPlantNoPositionSelect = async (): Promise<ApiResponse<GetPlant[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-for-selected/not-yet-plant`);
  const apiResponse = res.data as ApiResponse<GetPlant[]>;
  return apiResponse;
};

export const getPlantOfRow = async (landRowId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-for-selected-by-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantOfRowSelect[]>;
  return apiResponse;
};

export const updatePlantDead = async (plantId: number): Promise<ApiResponse<GetPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plants/dead-mark/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const getPlantOfStageActive = async (
  activeFunction: string,
): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `plants/get-for-selected/growth-stage-function?activeFunction=${activeFunction}`,
  );
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};
