import { axiosAuth } from "@/api";
import { CRITERIA_TARGETS, LOCAL_STORAGE_KEYS, MASTER_TYPE } from "@/constants";
import {
  ApiResponse,
  CriteriaApplyRequest,
  CriteriaDeleteRequest,
  CriteriaGraftedPlantCheckRequest,
  CriteriaMasterRequest,
  CriteriaPlantCheckRequest,
  GetCriteriaByMasterType,
  GetCriteriaObject,
  GetCriteriaSelect,
  GetData,
  GetPlantDetail,
  PlantCriteriaApplyRequest,
  ResetCriteriaPlantRequest,
} from "@/payloads";
import { CriteriaExportType } from "@/types";
import { buildParams, extractFilenameFromHeader } from "@/utils";

export const getCriteriaSet = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetCriteriaByMasterType>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("criterias/criteria-set", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetCriteriaByMasterType>>;
  return apiResponse.data as GetData<GetCriteriaByMasterType>;
};

export const createCriteria = async (
  criteriaSet: CriteriaMasterRequest,
): Promise<ApiResponse<GetCriteriaByMasterType>> => {
  const formatData = {
    createMasTypeRequest: {
      masterTypeName: criteriaSet.masterTypeName,
      masterTypeDescription: criteriaSet.masterTypeDescription,
      isActive: criteriaSet.isActive,
      createBy: localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME) ?? "",
      typeName: MASTER_TYPE.CRITERIA,
      target: criteriaSet.target,
    },
    criteriaCreateRequest: criteriaSet.criterias.map((item) => ({
      criteriaName: item.criteriaName,
      criteriaDescription: item.criteriaDescription,
      priority: item.priority,
      frequencyDate: item.frequencyDate,
      minValue: item.minValue,
      maxValue: item.maxValue,
      unit: item.unit,
      isActive: true,
    })),
  };
  const res = await axiosAuth.axiosJsonRequest.post(
    `criterias/create-master-type-criteria`,
    formatData,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaByMasterType>;
  return apiResponse;
};

export const updateCriteria = async (
  criteria: CriteriaMasterRequest,
): Promise<ApiResponse<GetCriteriaByMasterType>> => {
  const formatUpdateData = {
    masterTypeId: criteria.masterTypeId,
    masterTypeName: criteria.masterTypeName,
    masterTypeDescription: criteria.masterTypeDescription,
    isActive: criteria.isActive,
    target: criteria.target,
    criteriasCreateRequests: criteria.criterias.map((item) => ({
      criteriaId: item.criteriaId,
      criteriaName: item.criteriaName,
      criteriaDescription: item.criteriaDescription,
      minValue: item.minValue,
      maxValue: item.maxValue,
      unit: item.unit,
      priority: item.priority,
      frequencyDate: item.frequencyDate,
      isActive: true,
    })),
  };

  const res = await axiosAuth.axiosJsonRequest.put(
    `criterias/update-list-criteria`,
    formatUpdateData,
  );

  return res.data as ApiResponse<GetCriteriaByMasterType>;
};

export const getPlantLotCriteriaTypeSelect = async (
  lotId: number,
  target: string,
): Promise<ApiResponse<GetCriteriaSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/plantlot/get-for-selected/except?plantLotId=${lotId}&target=${target}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaSelect[]>;
  return apiResponse;
};

export const getPlantCriteriaTypeSelect = async (
  plantId: number,
  target: string,
): Promise<ApiResponse<GetCriteriaSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/plant/get-for-selected/except?plantId=${plantId}&target=${target}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaSelect[]>;
  return apiResponse;
};

export const getProductCriteriaTypeSelect = async (
  productId: number,
): Promise<ApiResponse<GetCriteriaSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/product/get-for-selected/except?productId=${productId}&target=${CRITERIA_TARGETS.Product}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaSelect[]>;
  return apiResponse;
};

export const getGraftedPlantCriteriaTypeSelect = async (
  graftedPlantId: number,
  target: string,
): Promise<ApiResponse<GetCriteriaSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/grafted-plant/get-for-selected/except?graftedId=${graftedPlantId}&target=${target}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaSelect[]>;
  return apiResponse;
};

export const getCriteriaByMasterType = async (
  typeId: number,
): Promise<ApiResponse<GetCriteriaByMasterType>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`criterias/set-criteria/${typeId}`);
  const apiResponse = res.data as ApiResponse<GetCriteriaByMasterType>;
  return apiResponse;
};

export const applyCriteria = async (
  criteria: CriteriaApplyRequest,
): Promise<ApiResponse<GetCriteriaByMasterType>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`criterias/target/apply-criteria`, criteria);
  const apiResponse = res.data as ApiResponse<GetCriteriaByMasterType>;
  return apiResponse;
};

export const applyPlantCriteria = async (
  criteria: PlantCriteriaApplyRequest,
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.post(
    `criterias/target/plant/apply-criteria`,
    criteria,
  );
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const getCriteriaOfLandPlot = async (
  lotId: number,
): Promise<ApiResponse<GetCriteriaObject[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/get-criteria-of-object?PlantLotID=${lotId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaObject[]>;
  return apiResponse;
};

export const getCriteriaOfPlant = async (
  plantId: number,
): Promise<ApiResponse<GetCriteriaObject[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/get-criteria-of-object?PlantID=${plantId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaObject[]>;
  return apiResponse;
};

export const getCriteriaOfGraftedPlant = async (
  graftedPlantId: number,
): Promise<ApiResponse<GetCriteriaObject[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/get-criteria-of-object?GraftedPlantID=${graftedPlantId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaObject[]>;
  return apiResponse;
};

export const checkGraftedPlantCriteria = async (
  check: CriteriaGraftedPlantCheckRequest,
): Promise<ApiResponse<object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(
    `criterias/target/grafted-plant/check-criteria`,
    check,
  );
  const apiResponse = res.data as ApiResponse<object>;
  return apiResponse;
};

export const checkPlantCriteria = async (
  check: CriteriaPlantCheckRequest,
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`criterias/target/plant/check-criteria`, check);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const resetPlantCriteria = async (
  reset: ResetCriteriaPlantRequest,
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`criterias/target/plant/reset-criteria`, reset);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const deleteCriteriaObject = async (
  criteria: CriteriaDeleteRequest,
): Promise<ApiResponse<object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(
    `criterias/target/delete-for-multiple-target`,
    { data: criteria },
  );
  return res.data as ApiResponse<object>;
};

export const exportCriteria = async (
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
  const res = await axiosAuth.axiosJsonRequest.get(`criterias/export-csv`, {
    params,
    responseType: "blob",
  });

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};
export const exportCriteriaByObject = async (
  type: CriteriaExportType,
  id: number,
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axiosAuth.axiosJsonRequest.get(`criterias/export-csv/object?${type}=${id}`, {
    responseType: "blob",
  });

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};
