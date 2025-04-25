import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetProcess, GetProcessDetail, GetProcessList, GetProcessSelect } from "@/payloads/process";
import { ProcessRequest, UpdateProcessRequest } from "@/payloads/process/requests/ProcessRequest";
import { buildParams } from "@/utils";

export const getProcesses = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetProcessList>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("processes", { params });

  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse.data as GetData<GetProcessList>;
};

export const getProcessesOfFarmForSelect = async (farmId?: number, isSample?: boolean) => {
  const queryParams = new URLSearchParams();
  if (typeof farmId !== "undefined") {
    queryParams.append("farmId", farmId.toString());
  }
  if (typeof isSample !== "undefined") {
    queryParams.append("isSample", isSample.toString());
  }
  const url = `proceesses/get-for-select${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const res = await axiosAuth.axiosJsonRequest.get(url);

  const apiResponse = res.data as ApiResponse<GetProcess[]>;

  return apiResponse.data.map(({ processId, processName }) => ({
    processId,
    processName,
  }));
};

export const getProcessDetail = async (processId: string | number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`processes/get-process-by-id/${processId}`);
  const apiResponse = res.data as ApiResponse<GetProcessDetail>;

  return {
    processId: apiResponse.data.processId,
    processCode: apiResponse.data.processCode,
    processName: apiResponse.data.processName,
    isDefault: apiResponse.data.isDefault,
    isActive: apiResponse.data.isActive,
    createDate: apiResponse.data.createDate,
    updateDate: apiResponse.data.updateDate,
    isDeleted: apiResponse.data.isDeleted,
    farmName: apiResponse.data.farmName,
    processMasterTypeModel: apiResponse.data.processMasterTypeModel,
    processGrowthStageModel: apiResponse.data.processGrowthStageModel,
    subProcesses: apiResponse.data.subProcesses,
    listProcessData: apiResponse.data.listProcessData,
    order: apiResponse.data.order,
    listPlanIsSampleTrue: apiResponse.data.listPlanIsSampleTrue,
    listPlanIsSampleFalse: apiResponse.data.listPlanIsSampleFalse,
    isSample: apiResponse.data.isSample,
    planTargetInProcess: apiResponse.data.planTargetInProcess,
  };
};

export const createProcess = async (type: ProcessRequest): Promise<ApiResponse<boolean>> => {
  const res = await axiosAuth.axiosMultipartForm.post(`processes`, type);
  return res.data as ApiResponse<boolean>;
};

export const updateFProcess = async (
  payload: UpdateProcessRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();

  formData.append("ProcessId", String(payload.ProcessId));
  if (payload.ProcessName) formData.append("ProcessName", payload.ProcessName);
  formData.append("IsActive", String(payload.IsActive));
  formData.append("IsDefault", String(payload.IsDefault));
  formData.append("IsDeleted", String(payload.IsDeleted));
  formData.append("MasterTypeId", String(payload.MasterTypeId));
  formData.append("GrowthStageID", String(payload.GrowthStageID));

  if (payload.ListUpdateSubProcess && payload.ListUpdateSubProcess.length > 0) {
    payload.ListUpdateSubProcess.forEach((subProcess, index) => {
      formData.append(
        `ListUpdateSubProcess[${index}]`,
        JSON.stringify({
          SubProcessId: subProcess.SubProcessId,
          SubProcessName: subProcess.SubProcessName,
          ParentSubProcessId: subProcess.ParentSubProcessId ?? null,
          IsDefault: subProcess.IsDefault,
          IsActive: subProcess.IsActive,
          MasterTypeId: subProcess.MasterTypeId ?? null,
          GrowthStageId: subProcess.GrowthStageId ?? null,
          Status: subProcess.Status,
          Order: subProcess.Order,
          ListPlan: subProcess.ListPlan,
        }),
      );
    });
  }

  if (payload.ListPlan && payload.ListPlan.length > 0) {
    console.log("payload.ListPlan", payload.ListPlan);

    payload.ListPlan.forEach((plan, index) => {
      formData.append(
        `ListPlan[${index}]`,
        JSON.stringify({
          PlanId: plan.PlanId,
          PlanName: plan.PlanName,
          PlanDetail: plan.PlanDetail,
          PlanNote: plan.PlanNote,
          GrowthStageId: plan.GrowthStageId,
          MasterTypeId: plan.MasterTypeId ?? null,
          PlanStatus: plan.PlanStatus,
        }),
      );
    });
  }
  console.log("form data", formData.getAll("ListPlan"));

  const res = await axiosAuth.axiosMultipartForm.put("processes/update-process-info", formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteProcess = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`processes/soft-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getProcessOfFarmByMasterType = async (processIds: number[]) => {
  const queryParams = processIds.map((id) => `id=${id}`).join("&");
  const res = await axiosAuth.axiosJsonRequest.get(
    `processes/for-selected-by-master-type?${queryParams}`,
  );
  const apiResponse = res.data as ApiResponse<GetProcessSelect[]>;
  return apiResponse.data.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
};
