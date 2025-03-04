import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetLandPlot,
  GetLandPlotSelected,
  GetLandPlotSimulate,
  LandPlotRequest,
} from "@/payloads";
import { getFarmId } from "@/utils";

export const getLandPlotsOfFarmForSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots/get-for-selected?farmId=${farmId}`);
  const apiResponse = res.data as ApiResponse<GetLandPlotSelected[]>;

  return apiResponse.data.map(({ id, name }) => ({
    id,
    name,
  }));
};

export const getLandPlotsSelected = async (): Promise<ApiResponse<GetLandPlotSelected[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots/get-for-selected`);
  const apiResponse = res.data as ApiResponse<GetLandPlotSelected[]>;
  return apiResponse;
};

export const getLandPlots = async (searchKey?: string): Promise<ApiResponse<GetLandPlot[]>> => {
  const url = searchKey
    ? `landplots?farmId=${getFarmId()}&searchKey=${searchKey}`
    : `landplots?farmId=${getFarmId()}`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<GetLandPlot[]>;
  return apiResponse;
};

export const getLandPlotSimulate = async (
  landPlotId: number,
): Promise<ApiResponse<GetLandPlotSimulate>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots/get-for-mapped/${landPlotId}`);
  const apiResponse = res.data as ApiResponse<GetLandPlotSimulate>;
  return apiResponse;
};

export const createLandPlot = async (plot: LandPlotRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post("landplots", plot);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
