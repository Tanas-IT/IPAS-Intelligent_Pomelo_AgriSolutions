import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetGrowthStage } from "@/payloads/growthStage";
import { buildParams, convertKeysToKebabCase } from "@/utils";

export const getGrowthStages = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetGrowthStage>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );
  
  const res = await axiosAuth.axiosJsonRequest.get("growthStages");
  
  const apiResponse = res.data as ApiResponse<Object>;
  
  return apiResponse.data as GetData<GetGrowthStage>;
};

export const getGrowthStagesOfFarmForSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`growthStages/get-for-select/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetGrowthStage[]>;
  console.log("apiResponse grow", apiResponse);
  

  return apiResponse.data.map(({ growthStageID, growthStageName }) => ({
    growthStageID,
    growthStageName
  }));
}
