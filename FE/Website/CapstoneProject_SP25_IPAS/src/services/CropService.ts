import { axiosAuth } from "@/api";
import {
  ApiResponse,
  FarmDocumentRequest,
  FarmRequest,
  GetFarmDocuments,
  GetFarmInfo,
  GetFarmPicker,
} from "@/payloads";
import { getFarmId, getUserId } from "@/utils";
export const getCropsOfFarm = async () => {
    const farmId = getFarmId();
    const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-of-farm`, { params: farmId})
}