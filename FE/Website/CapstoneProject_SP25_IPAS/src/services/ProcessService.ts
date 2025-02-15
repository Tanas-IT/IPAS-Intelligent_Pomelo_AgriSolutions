import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant } from "@/payloads";
import { GetProcess, GetProcessDetail, GetProcessList } from "@/payloads/process";
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

export const getProcessesOfFarmForSelect = async (farmId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<GetProcess[]>;

  return apiResponse.data.map(({ processId, processName }) => ({
    processId,
    processName
  }));
}

export const getProcessDetail = async (processId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`processes/get-process-by-id/${processId}`);
  const apiResponse = res.data as ApiResponse<GetProcessDetail>;

  return {
    processId: apiResponse.data.processId,
    processCode: apiResponse.data.processCode,
    processName: apiResponse.data.processName,
    isActive: apiResponse.data.isActive,
    createDate: apiResponse.data.createDate,
    updateDate: apiResponse.data.updateDate,
    isDeleted: apiResponse.data.isDeleted,
    farmName: apiResponse.data.farmName,
    masterTypeName: apiResponse.data.masterTypeName,
    growthStageName: apiResponse.data.growthStageName,
    subProcesses: apiResponse.data.subProcesses.map(({ subProcessId, subProcessCode, subProcessName }) => ({
      subProcessId,
      subProcessCode,
      subProcessName
    })),
  };
};

