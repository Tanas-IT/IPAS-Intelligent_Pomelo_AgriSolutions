import { axiosAuth } from "@/api";
import { ApiResponse, GetLandRow, GetLandRowSelected } from "@/payloads";
import { getFarmId } from "@/utils";

export const getLandRows = async (landPlotId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`landRows/get-for-selected/${landPlotId}`);
  const apiResponse = res.data as ApiResponse<GetLandRow[]>;
  console.log("apiResponse landRowOptions", apiResponse);

  return apiResponse;
};

export const getLandRowsSelected = async (
  landPlotId: number,
): Promise<ApiResponse<GetLandRowSelected[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`landRows/get-for-selected/${landPlotId}`);
  const apiResponse = res.data as ApiResponse<GetLandRowSelected[]>;
  return apiResponse;
};

export const getPlantIndexesByRowId = async (rowId: number): Promise<ApiResponse<number[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `landRows/get-for-selected/index-empty/${rowId}`,
  );
  const apiResponse = res.data as ApiResponse<number[]>;
  return apiResponse;
};
