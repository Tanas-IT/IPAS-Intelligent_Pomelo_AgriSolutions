import { axiosAuth } from "@/api";
import { ApiResponse, UserFarm } from "@/payloads";
import { getUserId } from "@/utils";

export const getFarmsOfUser = async (): Promise<ApiResponse<UserFarm[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get("farms/get-farm-of-user", {
    params: { userId: getUserId() },
  });
  const apiResponse = res.data as ApiResponse<UserFarm[]>;
  return apiResponse;
};
