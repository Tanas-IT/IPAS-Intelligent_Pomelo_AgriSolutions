import { axiosAuth } from "@/api";
import {
  ApiResponse,
  FarmDocumentRequest,
  FarmRequest,
  GetFarmDocuments,
  GetFarmInfo,
  GetFarmPicker,
  GetLandPlot,
} from "@/payloads";
import { getFarmId, getUserId } from "@/utils";

export const getLandPlotsOfFarmForSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<GetLandPlot[]>;

  return apiResponse.data.map(({ landPlotId, landPlotName }) => ({
    landPlotId,
    landPlotName
  }));
}

export const getLandPlots = async (searchKey?: string): Promise<ApiResponse<GetLandPlot[]>> => {
  const url = searchKey
    ? `landplots?farmId=${getFarmId()}&searchKey=${searchKey}`
    : `landplots?farmId=${getFarmId()}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<GetLandPlot[]>;
  return apiResponse;
};
