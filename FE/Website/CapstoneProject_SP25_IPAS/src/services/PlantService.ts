import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetLandRow, GetPlant, GetPlantOfRowSelect, GetPlantSelect } from "@/payloads";
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

export const getPlantOfRow = async (landRowId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-for-selected-by-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantOfRowSelect[]>;
  console.log('apiResponse landRowOptions',apiResponse);
  
  return apiResponse;
};
