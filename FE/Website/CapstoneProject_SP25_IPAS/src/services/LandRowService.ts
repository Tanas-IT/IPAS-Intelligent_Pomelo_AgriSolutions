import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetLandRow, GetLandRowSelected, landRowDetail } from "@/payloads";
import { buildParams, extractFilenameFromHeader } from "@/utils";

export const getLandRows = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  landPlotId?: number,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetLandRow>> => {
  const params = buildParams(currentPage, rowsPerPage, sortField, sortDirection, searchValue, {
    LandPlotId: landPlotId,
    ...additionalParams,
  });
  const res = await axiosAuth.axiosJsonRequest.get(`landRows/get-land-rows-of-plot-pagin`, {
    params,
  });
  const apiResponse = res.data as ApiResponse<GetData<GetLandRow>>;
  return apiResponse.data as GetData<GetLandRow>;
};

export const deleteLandRows = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`landRows/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
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

export const getPlantInRow = async (rowId: number): Promise<ApiResponse<landRowDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`landRows/${rowId}`);
  const apiResponse = res.data as ApiResponse<landRowDetail>;
  return apiResponse;
};

export const exportLandRows = async (
  additionalParams?: Record<string, any>,
): Promise<{ blob: Blob; filename: string }> => {
  const params = buildParams(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get(`landRows/export-csv`, {
    params,
    responseType: "blob",
  });

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};
