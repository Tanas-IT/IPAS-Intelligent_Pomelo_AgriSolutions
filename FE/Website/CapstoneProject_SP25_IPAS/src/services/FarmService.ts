import { axiosAuth } from "@/api";
import { ApiResponse, FarmRequest, GetFarmInfo, GetFarmPicker } from "@/payloads";
import { getUserId } from "@/utils";

export const getFarmsOfUser = async (): Promise<ApiResponse<GetFarmPicker[]>> => {
  const userId = getUserId();
  const res = await axiosAuth.axiosJsonRequest.get(`farms/get-farm-of-user/${userId}`);
  const apiResponse = res.data as ApiResponse<GetFarmPicker[]>;
  return apiResponse;
};

export const getFarm = async (farmId: string): Promise<ApiResponse<GetFarmInfo>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`farms/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetFarmInfo>;
  return apiResponse;
};

export const updateFarmInfo = async (farm: FarmRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put("farms/update-farm-info", farm);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateFarmLogo = async (image: File): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("FarmLogo", image);
  const res = await axiosAuth.axiosMultipartForm.patch("farms/update-farm-logo", formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
