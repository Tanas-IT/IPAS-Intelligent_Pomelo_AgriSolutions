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


  formData.append("planName", plan.planName);
  formData.append("startDate", startDate.toISOString());
  formData.append("endDate", endDate.toISOString());
  formData.append("startTime", plan.startTime);
  formData.append("endTime", plan.endTime);
  formData.append("isActive", plan.isActive.toString());
  formData.append("planDetail", plan.planDetail);
  formData.append("frequency", plan.frequency);
  formData.append("landPlotId", plan.landPlotId.toString());
  formData.append("assignorId", plan.assignorId.toString());
  formData.append("processId", plan.processId.toString());
  formData.append("cropId", plan.cropId.toString());
  formData.append("growthStageId", plan.growthStageId.toString());
  formData.append("masterTypeId", plan.masterTypeId.toString());

  if (plan.responsibleBy) {
    plan.responsibleBy.forEach((id, index) => {
        formData.append(`responsibleBy[${index}]`, id);
    });
}
  plan.dayOfWeek.forEach((day, index) => {
    formData.append(`dayOfWeek[${index}]`, day.toString());
  });
  plan.dayOfMonth.forEach((day, index) => {
    formData.append(`dayOfMonth[${index}]`, day.toString());
  });
  if (plan.customDates) {
    plan.customDates.forEach((date, index) => {
        formData.append(`customDates[${index}]`, date.toISOString());
    });
}

  plan.listEmployee.forEach((employee, index) => {
    formData.append(`listEmployee[${index}][userId]`, employee.userId.toString());
    formData.append(`listEmployee[${index}][isReporter]`, employee.isReporter.toString());
  });

  const res = await axiosAuth.axiosJsonRequest.post(`plan`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
}
