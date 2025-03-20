import { axiosAuth } from "@/api";
import { LOCAL_STORAGE_KEYS, MASTER_TYPE } from "@/constants";
import {
  ApiResponse,
  CriteriaApplyRequest,
  CriteriaCheckRequest,
  CriteriaDeleteRequest,
  CriteriaMasterRequest,
  GetCriteriaByMasterType,
  GetCriteriaObject,
  GetCriteriaSelect,
  GetData,
} from "@/payloads";
import { buildParams } from "@/utils";

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
      isActive: true,
    })),
  };

  const res = await axiosAuth.axiosJsonRequest.put(
    `criterias/update-list-criteria`,
    formatUpdateData,
  );

  return res.data as ApiResponse<GetCriteriaByMasterType>;
};

export const getCriteriaTypeSelect = async (
  lotId: number,
  target: string,
): Promise<ApiResponse<GetCriteriaSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/plantlot/get-for-selected/except?plantLotId=${lotId}&target=${target}`,
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

export const getCriteriaOfLandPlot = async (
  lotId: number,
): Promise<ApiResponse<GetCriteriaObject[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `criterias/get-criteria-of-object?PlantLotID=${lotId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCriteriaObject[]>;
  return apiResponse;
};

export const checkCriteria = async (check: CriteriaCheckRequest): Promise<ApiResponse<object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(
    `criterias/target/check-criteria-for-target`,
    check,
  );
  const apiResponse = res.data as ApiResponse<object>;
  return apiResponse;
};

export const deleteCriteriaObject = async (
  criteria: CriteriaDeleteRequest,
): Promise<ApiResponse<object>> => {
  console.log(criteria);

  const res = await axiosAuth.axiosJsonRequest.delete(
    `criterias/target/delete-for-multiple-target`,
    { data: criteria },
  );
  return res.data as ApiResponse<object>;
};
