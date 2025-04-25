import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { ManagerHomeData } from "@/types/dashboard";

export const getManagerHome = async (): Promise<ManagerHomeData> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `report/manager/home-mobile`
  );
  const apiResponse = res.data as ApiResponse<ManagerHomeData>;
  return apiResponse.data;
};
