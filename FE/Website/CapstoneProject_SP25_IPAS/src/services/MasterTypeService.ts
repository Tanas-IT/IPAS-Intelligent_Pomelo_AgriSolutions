import { LOCAL_STORAGE_KEYS } from "@/constants";
import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetMasterType, GetType, MasterTypeRequest } from "@/payloads";
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
  const apiResponse = res.data as ApiResponse<GetData<GetMasterType>>;
  return apiResponse.data as GetData<GetMasterType>;
};

export const getTypeByName = async (name: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`masterTypes?typeName=${name}`);
  const apiResponse = res.data as ApiResponse<{ list: GetType[] }>;
  console.log("apiResponse", apiResponse);

  return apiResponse.data.list.map(({ masterTypeId, masterTypeName }) => ({
    masterTypeId,
    masterTypeName,
  }));
};

export const getSelectMasterTypes = async (
  typeName: string,
): Promise<ApiResponse<GetMasterType[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`masterTypes/get-masterType-by-name`, {
    params: {
      typeName,
    },
  });
  const apiResponse = res.data as ApiResponse<GetMasterType[]>;
  return apiResponse;
};

export const deleteMasterTypes = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`masterTypes/delete-softed`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateMasterType = async (
  type: MasterTypeRequest,
): Promise<ApiResponse<GetMasterType>> => {
  const res = await axiosAuth.axiosJsonRequest.put("masterTypes/update-masterType-info", type);
  const apiResponse = res.data as ApiResponse<GetMasterType>;
  return apiResponse;
};

export const createMasterType = async (
  type: MasterTypeRequest,
): Promise<ApiResponse<GetMasterType>> => {
  type.createBy = localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME) ?? "";
  const res = await axiosAuth.axiosJsonRequest.post(`masterTypes`, type);
  const apiResponse = res.data as ApiResponse<GetMasterType>;
  return apiResponse;
};

export const getMasterTypeSelect = async (
  type: MasterTypeRequest,
): Promise<ApiResponse<GetMasterType>> => {
  type.createBy = localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME) ?? "";
  const res = await axiosAuth.axiosJsonRequest.post(`masterTypes`, type);
  const apiResponse = res.data as ApiResponse<GetMasterType>;
  return apiResponse;
};
