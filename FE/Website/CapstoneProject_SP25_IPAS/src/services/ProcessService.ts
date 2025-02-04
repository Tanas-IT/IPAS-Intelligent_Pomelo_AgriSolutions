import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetProcess } from "@/payloads/process";
import { buildParams } from "@/utils";

export const getProcesses = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetProcess>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    brandId,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("processes", { params });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse.data as GetData<GetProcess>;
};
