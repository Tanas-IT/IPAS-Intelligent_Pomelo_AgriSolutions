import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetMasterType } from "@/payloads";
import { buildParams } from "@/utils";

export const getMasterTypes = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetMasterType>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("masterTypes", { params });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse.data as GetData<GetMasterType>;
};
