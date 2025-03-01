import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetPlant,
  GetPlantDetail,
  GetPlantSelect,
  PlantRequest,
} from "@/payloads";
import { buildParams, getFarmId } from "@/utils";

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

export const deletePlant = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
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
      formData.append(key, value instanceof File ? value : value.toString());
    }
  });

  const res = await axiosAuth.axiosMultipartForm.post(`plants`, formData);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};
