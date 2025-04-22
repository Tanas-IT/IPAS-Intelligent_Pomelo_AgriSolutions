import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPartner, GetPartnerSelected, PartnerRequest } from "@/payloads";
import { buildParams, extractFilenameFromHeader } from "@/utils";

export const getPartners = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPartner>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("partners", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetPartner>>;
  return apiResponse.data as GetData<GetPartner>;
};

export const deletePartners = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`partners/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePartner = async (partner: PartnerRequest): Promise<ApiResponse<GetPartner>> => {
  const res = await axiosAuth.axiosJsonRequest.put("partners/update-partner-info", partner);
  const apiResponse = res.data as ApiResponse<GetPartner>;
  return apiResponse;
};

export const createPartner = async (
  partner: PartnerRequest,
): Promise<ApiResponse<PartnerRequest>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`partners`, partner);
  const apiResponse = res.data as ApiResponse<GetPartner>;
  return apiResponse;
};

export const getSelectPartner = async (
  major: string,
): Promise<ApiResponse<GetPartnerSelected[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`partners/get-for-selected?Major=${major}`);
  const apiResponse = res.data as ApiResponse<GetPartnerSelected[]>;
  return apiResponse;
};

export const exportPartners = async (
  additionalParams?: Record<string, any>,
): Promise<{ blob: Blob; filename: string }> => {
  const params = buildParams(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get(`partners/export-csv`, {
    params,
    responseType: "blob",
  });

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};
