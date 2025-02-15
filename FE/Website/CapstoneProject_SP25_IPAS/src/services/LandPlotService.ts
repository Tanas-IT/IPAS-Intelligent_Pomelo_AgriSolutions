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

export const getLandPlotsOfFarmForSelect = async (farmId: string) => {
  
}

// export const getLandPlots = async (searchKey: string): Promise<ApiResponse<GetFarmInfo>> => {
//   const res = await axiosAuth.axiosJsonRequest.get(`farms/${farmId}`);
//   const apiResponse = res.data as ApiResponse<GetFarmInfo>;
//   return apiResponse;
// };