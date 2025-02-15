import { axiosAuth } from "@/api";
import {
  ApiResponse,
  FarmDocumentRequest,
  FarmRequest,
  GetFarmDocuments,
  GetFarmInfo,
  GetFarmPicker,
} from "@/payloads";
import { GetLandPlot } from "@/payloads/landplot";

export const getLandPlotsOfFarmForSelect = async (farmId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<GetLandPlot[]>;

  return apiResponse.data.map(({ landPlotId, landPlotName }) => ({
    landPlotId,
    landPlotName
  }));
}