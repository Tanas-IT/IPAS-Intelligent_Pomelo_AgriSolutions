import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetMasterType, GetPlant, GetPlantLot2, GetPlantTargetResponse } from "@/payloads";
import { GetPlan, GetPlanSelect, ProcessByPlanResponse, ProcessResponse } from "@/payloads/plan";
import { PlanRequest, UpdatePlanRequest } from "@/payloads/plan/requests/PlanRequest";
import { buildParams, convertKeysToKebabCase } from "@/utils";

export const getPlans = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  // brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlan>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );

  const res = await axiosAuth.axiosJsonRequest.get("plan", { params });
  const apiResponse = res.data as ApiResponse<Object>;

  return apiResponse.data as GetData<GetPlan>;
};

export const addPlan = async (plan: PlanRequest): Promise<ApiResponse<Object>> => {

  const payload = {
    startDate: new Date(plan.startDate).toISOString(),
    endDate: new Date(plan.endDate).toISOString(),
    isActive: plan.isActive,
    planName: plan.planName,
    notes: plan.notes || "",
    planDetail: plan.planDetail,
    responsibleBy: plan.responsibleBy || "",
    frequency: plan.frequency,
    assignorId: plan.assignorId,
    pesticideName: plan.pesticideName || "",
    maxVolume: plan.maxVolume || 0,
    minVolume: plan.minVolume || 0,
    processId: plan.processId,
    cropId: plan.cropId,
    growthStageId: plan.growthStageId,
    isDelete: plan.isDelete || false,
    masterTypeId: plan.masterTypeId,
    dayOfWeek: plan.dayOfWeek || [],
    dayOfMonth: plan.dayOfMonth || [],
    customDates: plan.customDates?.map(date => new Date(date).toISOString()) || [],
    listEmployee: plan.listEmployee.map(employee => ({
      userId: employee.userId,
      isReporter: employee.isReporter
    })),
    startTime: plan.startTime,
    endTime: plan.endTime,
    planTargetModel: plan.planTargetModel?.map(target => ({
      landPlotID: target.landPlotID ?? 0,
      landRowID: Array.isArray(target.landRowID) ? target.landRowID : [],
      plantID: Array.isArray(target.plantID) ? target.plantID : [],
      graftedPlantID: Array.isArray(target.graftedPlantID) ? target.graftedPlantID : [],
      plantLotID: Array.isArray(target.plantLotID) ? target.plantLotID : [],
      unit: target.unit,
    })) || []
  };

  const res = await axiosAuth.axiosJsonRequest.post(`plan`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
}

export const getPlanDetail = async (planId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`plan/get-plan-by-id/${planId}`);
  const apiResponse = res.data as ApiResponse<GetPlan>;

  return apiResponse.data;
}

export const filterTargetByUnitGrowthStage = async (unit: string, listGrowthStage: number[], farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.post(`plan/filter-by-growth-stage?farmId=${farmId}&unit=${unit}`,
    { listGrowthStage });
  const apiResponse = res.data as ApiResponse<GetPlantTargetResponse[]>;
  return apiResponse.data;
};

export const filterPlantLotsByUnitAndGrowthStage = async (unit: string, listGrowthStage: number[], farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.post(`plan/filter-by-growth-stage?farmId=${farmId}&unit=${unit}`,
    { listGrowthStage });
  const apiResponse = res.data as ApiResponse<GetPlantTargetResponse[]>;
  return apiResponse.data.flatMap((lot) =>
    lot.plantLots.map((lotItem) => ({
      value: lotItem.plantLotId,
      label: lotItem.plantLotName,
    }))
  );
};

export const deletePlan = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plan/soft-delete-plan`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const filterTypeWorkByGrowthStage = async (listGrowthStage: number[]) => {
  const res = await axiosAuth.axiosJsonRequest.post(`plan/type-work/filter-by-growth-stage`,
    { listGrowthStage });
  const apiResponse = res.data as ApiResponse<GetMasterType[]>;
  return apiResponse.data;
};

export const filterMasterTypeByGrowthStage = async (listGrowthStage: number[], typeName: string) => {
  const res = await axiosAuth.axiosJsonRequest.post(`plan/type-name/filter-by-growth-stage`,
    {
      listGrowthStage,
      typeName
    });
  const apiResponse = res.data as ApiResponse<GetMasterType[]>;
  return apiResponse.data;
};

export const updatePlan = async (payload: UpdatePlanRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`plan`, payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const createManyPlans = async (plan: PlanRequest[], farmId: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`plan/create-many?farmId=${farmId}`, plan);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getPlansForSelect = async (farmId: number): Promise<ApiResponse<GetPlanSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plan/get-for-select/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetPlanSelect[]>;
  return apiResponse;
};

export const getPlanByProcessId = async (processId: number): Promise<ApiResponse<ProcessResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plan/get-plan-by-process-id/${processId}`);
  const apiResponse = res.data as ApiResponse<ProcessResponse>;
  return apiResponse;
};

export const getProcessByPlanId = async (planId: number, farmId: number): Promise<ApiResponse<ProcessByPlanResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plan/get-process-by-plan-id/${planId}?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<ProcessByPlanResponse>;
  return apiResponse;
}