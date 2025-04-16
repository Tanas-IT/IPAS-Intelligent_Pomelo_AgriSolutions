import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetLandPlot,
  GetLandPlotHaveEmptyPlant,
  GetLandPlotOfFarm,
  GetLandPlotSelected,
  GetLandPlotSimulate,
  LandPlotRequest,
  LandPlotUpdateCoordinationRequest,
  LandPlotUpdateRequest,
} from "@/payloads";

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

export const getLandPlots = async (searchKey?: string): Promise<ApiResponse<GetLandPlotOfFarm>> => {
  // const url = searchKey
  //   ? `landplots?farmId=${getFarmId()}&searchKey=${searchKey}`
  //   : `landplots?farmId=${getFarmId()}`;
  const url = searchKey ? `landplots?searchKey=${searchKey}` : `landplots`;
  const res = await axiosAuth.axiosJsonRequest.get(url);
  const apiResponse = res.data as ApiResponse<GetLandPlotOfFarm>;
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

export const deleteLandPlot = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`landplots/softed-delete`, id);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateLandPlotInfo = async (
  plot: LandPlotUpdateRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`landplots/update-info`, plot);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateLandPlotCoordination = async (
  coord: LandPlotUpdateCoordinationRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`landplots/update-coordination`, coord);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getLandPlotHaveEmptyPlant = async (): Promise<
  ApiResponse<GetLandPlotHaveEmptyPlant[]>
> => {
  const res = await axiosAuth.axiosJsonRequest.get(`landplots/have-empty-index`);
  const apiResponse = res.data as ApiResponse<GetLandPlotHaveEmptyPlant[]>;
  return apiResponse;
};
