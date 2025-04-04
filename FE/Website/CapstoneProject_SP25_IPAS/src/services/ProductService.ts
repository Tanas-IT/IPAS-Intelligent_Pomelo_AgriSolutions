import { axiosAuth } from "@/api";
import { MASTER_TYPE } from "@/constants";
import { ApiResponse, GetData, GetProduct } from "@/payloads";
import { buildParams } from "@/utils";

export const getProducts = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetProduct>> => {
  const params = buildParams(currentPage, rowsPerPage, sortField, sortDirection, searchValue, {
    typeName: MASTER_TYPE.PRODUCT,
    ...additionalParams,
  });

  const res = await axiosAuth.axiosJsonRequest.get("masterTypes", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetProduct>>;
  return apiResponse.data as GetData<GetProduct>;
};
