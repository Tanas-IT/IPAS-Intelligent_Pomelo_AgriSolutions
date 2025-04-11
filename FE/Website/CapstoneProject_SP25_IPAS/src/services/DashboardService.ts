import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { CompareWorkPerformanceRequest, CompareWorkPerformanceResponse, DashboardResponses, EmployeeListItem, MaterialInstore, PomeloQualityBreakdownResponse, SeasonalYieldResponse, StatisticPlanData } from "@/payloads/dashboard";
import { getFarmId } from "@/utils";

export const getDashboardData = async (year: number = 2023, month: number = 3) => {
  const res = await axiosAuth.axiosJsonRequest.get(`report/dashboard?year=${year}&month=${month}&farmId=${getFarmId()}`);
  const apiResponse = res.data as ApiResponse<DashboardResponses>;
  console.log("Dashboard Data: ", apiResponse);
  return apiResponse.data;
};

export const getMaterialInStore = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`report/dashboard/materials-in-store?year=${year}`);
  const apiResponse = res.data as ApiResponse<MaterialInstore[]>;
  console.log("MaterialInStore Data: ", apiResponse);
  return apiResponse.data;
};

export const getSeasonalYield = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/dashboard/season-yield?year=${year}`
  );
  const apiResponse = res.data as ApiResponse<SeasonalYieldResponse["data"]>;
  console.log("Seasonal Yield Data: ", apiResponse);
  return apiResponse.data;
};

export const getPomeloQualityBreakdown = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/dashboard/pomelo-quality-breakdown?year=${year}`
  );
  const apiResponse = res.data as ApiResponse<PomeloQualityBreakdownResponse[]>;
  console.log("Pomelo Quality Breakdown Data: ", apiResponse);
  return apiResponse;
}

export const getStatisticPlan = async (year: number, month?: number) => {
  const url = month
    ? `report/dashboard/statistic-plan?year=${year}&month=${month}`
    : `report/dashboard/statistic-plan?year=${year}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<StatisticPlanData>;
  console.log("Statistic Plan Data: ", apiResponse);
  return apiResponse.data;
}

// export const getEmployeeList = async (type: "top" | "bottom" = "top", limit: number = 10, search?: string) => {
//   let url = `report/dashboard/work-performance?top=${limit}`; // API hiện tại dùng "top"
//   if (search) url += `&search=${encodeURIComponent(search)}`;
//   // Nếu BE sửa API, thay bằng: `?type=${type}&limit=${limit}&search=...`
//   const res = await axiosAuth.axiosJsonRequest.get(url);
//   const apiResponse = res.data as ApiResponse<EmployeeListItem[]>;
//   console.log("Employee List Data: ", apiResponse);
//   return apiResponse.data;
// }

export const getEmployeeList = async (
  type: "top" | "bottom" = "top",
  limit: number = 10,
  search?: string,
  minScore?: number,
  maxScore?: number
) => {
  let url = `report/dashboard/employee-list?top=${limit}`; // API hiện tại
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (minScore !== undefined && maxScore !== undefined) {
    url += `&minScore=${minScore}&maxScore=${maxScore}`; // Giả sử BE sẽ thêm
  }
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<EmployeeListItem[]>;
  console.log("Employee List Data: ", apiResponse);
  return apiResponse.data;
}

export const compareWorkPerformance = async (employeeIds: number[]) => {
  const res = await axiosAuth.axiosJsonRequest.post(
    "report/dashboard/compare-work-performance",
    { listEmployee: employeeIds } as CompareWorkPerformanceRequest
  );
  const apiResponse = res.data as ApiResponse<CompareWorkPerformanceResponse>;
  console.log("Compare Work Performance Data: ", apiResponse);
  return apiResponse.data;
}