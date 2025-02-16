import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetType } from "@/payloads/masterType";
import { buildParams, convertKeysToKebabCase } from "@/utils";

export const getMasterType = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetType>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );
  
  const res = await axiosAuth.axiosJsonRequest.get(`masterTypes`);
  
  const apiResponse = res.data as ApiResponse<Object>;
  
  return apiResponse.data as GetData<GetType>;
};

export const getTypeByName = async (name: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`masterTypes?typeName=${name}`);
  const apiResponse = res.data as ApiResponse<{ list: GetType[] }>;
  console.log("apiResponse", apiResponse);
  

  return apiResponse.data.list.map(({ masterTypeId, masterTypeName }) => ({
    masterTypeId,
    masterTypeName
  }));
}
