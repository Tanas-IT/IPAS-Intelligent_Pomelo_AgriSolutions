import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { DashboardResponses, MaterialInstore } from "@/payloads/dashboard";
import { getFarmId } from "@/utils";

export const getDashboardData = async (year: number = 2023, month: number = 3) => {
  const res = await axiosAuth.axiosJsonRequest.get(`report/dashboard?year=${year}&month=${month}&farmId=${getFarmId()}`);
  const apiResponse = res.data as ApiResponse<DashboardResponses>;
  console.log("Dashboard Data: ", apiResponse);
  return apiResponse.data;
};

export const getMaterialInStore = async (year: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`report/dashboard/materials-in-store?year=${year}`);
  const apiResponse = res.data as ApiResponse<MaterialInstore>;
  console.log("MaterialInStore Data: ", apiResponse);
  return apiResponse.data;
};