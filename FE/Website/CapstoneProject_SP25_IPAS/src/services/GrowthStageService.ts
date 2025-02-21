import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetGrowthStage, GrowthStageRequest } from "@/payloads";
import { buildParams } from "@/utils";

export const getGrowthStages = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetGrowthStage>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("growthStages", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetGrowthStage>>;
  return apiResponse.data as GetData<GetGrowthStage>;
};

export const deleteGrowthStages = async (
  ids: number[] | string[],
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`growthStages/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateGrowthStage = async (
  stage: GrowthStageRequest,
): Promise<ApiResponse<GetGrowthStage>> => {
  const res = await axiosAuth.axiosJsonRequest.put("growthStages/update-growthStage-info", stage);
  const apiResponse = res.data as ApiResponse<GetGrowthStage>;
  return apiResponse;
};

export const createGrowthStage = async (
  stage: GrowthStageRequest,
): Promise<ApiResponse<GetGrowthStage>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`growthStages`, stage);
  const apiResponse = res.data as ApiResponse<GetGrowthStage>;
  return apiResponse;
};
