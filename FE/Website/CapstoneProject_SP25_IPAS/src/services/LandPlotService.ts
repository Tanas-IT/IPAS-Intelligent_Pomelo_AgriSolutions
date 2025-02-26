import { axiosAuth } from "@/api";
import { ApiResponse, GetLandPlot } from "@/payloads";
import { getFarmId } from "@/utils";

export const getLandPlotsOfFarmForSelect = async (farmId: string) => {};

export const getLandPlots = async (searchKey?: string): Promise<ApiResponse<GetLandPlot[]>> => {
  const url = searchKey
    ? `landplots?farmId=${getFarmId()}&searchKey=${searchKey}`
    : `landplots?farmId=${getFarmId()}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<GetLandPlot[]>;
  return apiResponse;
};
