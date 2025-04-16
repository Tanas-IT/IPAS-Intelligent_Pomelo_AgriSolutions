import { axiosAuth, axiosNoAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetType } from "@/payloads/masterType";
import { GetPackage } from "@/payloads/package";
import { buildParams, convertKeysToKebabCase } from "@/utils";

export const getPackage = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPackage>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );

  const res = await axiosAuth.axiosJsonRequest.get(`packages`);

  const apiResponse = res.data as ApiResponse<Object>;

  return apiResponse.data as GetData<GetPackage>;
};

export const getPackagePurchase = async (): Promise<ApiResponse<GetPackage[]>> => {
  const res = await axiosNoAuth.get(`packages`);
  const apiResponse = res.data as ApiResponse<GetPackage[]>;
  return apiResponse;
};

export const getPackageById = async (packageId: number): Promise<ApiResponse<GetPackage>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`packages/${packageId}`);
  const apiResponse = res.data as ApiResponse<GetPackage>;
  return apiResponse;
};

export const getPackageSelected = async (): Promise<ApiResponse<GetPackage[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`packages`);
  const apiResponse = res.data as ApiResponse<GetPackage[]>;
  return apiResponse;
};
