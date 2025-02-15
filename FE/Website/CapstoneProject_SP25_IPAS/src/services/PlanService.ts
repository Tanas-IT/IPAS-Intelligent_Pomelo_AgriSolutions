import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetPlan } from "@/payloads/plan";
import { buildParams, convertKeysToKebabCase } from "@/utils";

export const getPlans = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlan>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );
  console.log("params",params);
  console.log("additionalParams",additionalParams);
  const kebabParams = convertKeysToKebabCase(params);

  console.log("🚀 Converted Params:", kebabParams); 
  
  const res = await axiosAuth.axiosJsonRequest.get("plan", { params: {
    // "filter-is-active": false
  } });
  console.log('res', res);
  
  const apiResponse = res.data as ApiResponse<Object>;
  console.log("apiResponse", apiResponse);
  
  return apiResponse.data as GetData<GetPlan>;
};
