import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CriteriaApplyRequests,
  GetCriteriaByMasterType,
  GetCriteriaObject,
} from "@/payloads";

export const getCriteriaByMasterType = async (
  typeId: number,
): Promise<ApiResponse<GetCriteriaByMasterType>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`criterias/set-criteria/${typeId}`);
  const apiResponse = res.data as ApiResponse<GetCriteriaByMasterType>;
  return apiResponse;
};

export const applyCriteria = async (
  criteria: CriteriaApplyRequests,
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
