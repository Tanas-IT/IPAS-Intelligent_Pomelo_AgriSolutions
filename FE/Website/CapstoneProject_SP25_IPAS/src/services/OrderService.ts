import { axiosAuth } from "@/api";
import { ApiResponse, GetData } from "@/payloads";
import { GetOrder } from "@/payloads/order/responses/GetOrder";
import { buildParams } from "@/utils";

export const getOrder = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<ApiResponse<GetOrder[]>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );
  
  const res = await axiosAuth.axiosJsonRequest.get(`order/farm`);
  
  const apiResponse = res.data as ApiResponse<GetOrder[]>;
  
  return apiResponse;
};