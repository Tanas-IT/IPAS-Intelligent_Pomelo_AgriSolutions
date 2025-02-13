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