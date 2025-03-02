import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetPlan } from "@/payloads/plan";
import { PlanRequest } from "@/payloads/plan/requests/PlanRequest";
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
  console.log('res', res);
  
  const apiResponse = res.data as ApiResponse<Object>;
  
  return apiResponse.data as GetData<GetPlan>;
};

export const addPlan = async ( plan: PlanRequest): Promise<ApiResponse<Object>> => {
  console.log("plan", plan);
  
  const formData = new FormData();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);


  const payload = {
    startDate: new Date(plan.startDate).toISOString(),
    endDate: new Date(plan.endDate).toISOString(),
    isActive: plan.isActive,
    planName: plan.planName,
    notes: plan.notes|| "", // Nếu có
    planDetail: plan.planDetail,
    responsibleBy: plan.responsibleBy || "", // Nếu có
    frequency: plan.frequency,
    assignorId: plan.assignorId,
    pesticideName: plan.pesticideName || "", // Nếu có
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
        landRowID: target.landRowID,
        landPlotID: target.landPlotID,
        graftedPlantID: target.graftedPlantID,
        plantLotID: target.plantLotID,
        plantID: target.plantID
    })) || []
};

  const res = await axiosAuth.axiosJsonRequest.post(`plan`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
}

export const getPlanDetail = async (planId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`plan/get-plan-by-id/${planId}`);
  const apiResponse = res.data as ApiResponse<GetPlan>;

  return apiResponse.data;
}
