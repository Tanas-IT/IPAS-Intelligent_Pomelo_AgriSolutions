import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import {
  AdminDashboardResponses,
  CompareWorkPerformanceRequest,
  CompareWorkPerformanceResponse,
  DashboardResponses,
  DeadAndAlive,
  EmployeeDashboardData,
  EmployeeListItem,
  MaterialInstore,
  PomeloQualityBreakdownResponse,
  ProductivityByPlotResponse,
  SeasonalYieldResponse,
  StatisticPlanData,
} from "@/payloads/dashboard";
import { getFarmId } from "@/utils";

export const getDashboardData = async (year: number = 2023, month: number = 3) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/dashboard?year=${year}&month=${month}&farmId=${getFarmId()}`,
  );
  const apiResponse = res.data as ApiResponse<DashboardResponses>;
  return apiResponse.data;
};

export const getProductivityByPlot = async (year: number) => {
  const url = `report/dashboard/productivity-by-plot?year=${year}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<ProductivityByPlotResponse[]>;
  return apiResponse.data;
};

export const getMaterialInStore = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/dashboard/materials-in-store?year=${year}`,
  );
  const apiResponse = res.data as ApiResponse<MaterialInstore[]>;
  return apiResponse.data;
};

export const getSeasonalYield = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`report/dashboard/season-yield?year=${year}`);
  const apiResponse = res.data as ApiResponse<SeasonalYieldResponse["data"]>;
  return apiResponse.data;
};

export const getPomeloQualityBreakdown = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/dashboard/pomelo-quality-breakdown?year=${year}`,
  );
  const apiResponse = res.data as ApiResponse<PomeloQualityBreakdownResponse[]>;
  return apiResponse;
};

export const getStatisticPlan = async (year: number, month?: number) => {
  const url = month
    ? `report/dashboard/statistic-plan?year=${year}&month=${month}`
    : `report/dashboard/statistic-plan?year=${year}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<StatisticPlanData>;
  return apiResponse.data;
};

export const getEmployeeList = async (
  type: "top" | "bottom" = "top",
  limit: number = 10,
  search?: string,
  minScore?: number,
  maxScore?: number,
) => {
  let url = `report/dashboard/work-performance?limit=${limit}&type=${type}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (minScore !== undefined && maxScore !== undefined) {
    url += `&minScore=${minScore}&maxScore=${maxScore}`;
  }
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<EmployeeListItem[]>;
  return apiResponse.data;
};

export const compareWorkPerformance = async (employeeIds: number[]) => {
  const res = await axiosAuth.axiosJsonRequest.post("report/dashboard/compare-work-performance", {
    listEmployee: employeeIds,
  } as CompareWorkPerformanceRequest);
  const apiResponse = res.data as ApiResponse<CompareWorkPerformanceResponse>;
  return apiResponse.data;
};

export const getAdminDashboardData = async (yearRevenue?: number, yearFarm?: number) => {
  const params = new URLSearchParams();

  if (yearRevenue !== undefined) params.append("YearRevenue", yearRevenue.toString());
  if (yearFarm !== undefined) params.append("YearFarm", yearFarm.toString());

  const res = await axiosAuth.axiosJsonRequest.get(`report/admin/dashboard?${params.toString()}`);

  const apiResponse = res.data as ApiResponse<AdminDashboardResponses>;
  return apiResponse.data;
};

export const getDeadAndAlive = async () => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/plant/statistic-dead-and-alive`,
  );
  const apiResponse = res.data as ApiResponse<DeadAndAlive>;
  return apiResponse.data;
};

export const getEmployeeDashboard = async (farmId: number, userId: number): Promise<EmployeeDashboardData> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/employee/dashboard?farmId=${farmId}&userId=${userId}`,
  );
  const apiResponse = res.data as ApiResponse<EmployeeDashboardData>;
  return apiResponse.data;
};