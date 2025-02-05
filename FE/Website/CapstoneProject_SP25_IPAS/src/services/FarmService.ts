import { axiosAuth } from "@/api";
import { ApiResponse, UserFarm } from "@/payloads";
import { getUserId } from "@/utils";

export const getFarmsOfUser = async (): Promise<ApiResponse<UserFarm>> => {
  const res = await axiosAuth.axiosJsonRequest.post("farms/get-farm-of-user", {
    userId: getUserId(),
  });
  const apiResponse = res.data as ApiResponse<UserFarm>;
  return apiResponse;
};
