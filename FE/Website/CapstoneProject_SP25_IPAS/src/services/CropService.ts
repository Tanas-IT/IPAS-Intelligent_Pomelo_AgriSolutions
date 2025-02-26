import { axiosAuth } from "@/api";
import {
  ApiResponse,
  FarmDocumentRequest,
  FarmRequest,
  GetFarmDocuments,
  GetFarmInfo,
  GetFarmPicker,
} from "@/payloads";
import { GetCrop } from "@/payloads/crop";
import { getFarmId, getUserId } from "@/utils";
export const getCropsOfFarm = async () => {
    const farmId = getFarmId();
    const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-of-farm`, { params: farmId})
}

export const getCropsOfFarmForSelect = async (farmId: string) => {
  console.log('farm', farmId);
  
  const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-of-farm-selected?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<GetCrop[]>;
  
    return apiResponse.data.map(({ cropId, cropName }) => ({
      cropId, 
      cropName
    }));
}

export const getCropsOfLandPlotForSelect = async (landplotId: number) => {
  console.log('landplotId', landplotId);
  
  const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-of-landplot-selected?landplotId=${landplotId}`);
  const apiResponse = res.data as ApiResponse<GetCrop[]>;
  
    return apiResponse.data.map(({ cropId, cropName }) => ({
      cropId, 
      cropName
    }));
}