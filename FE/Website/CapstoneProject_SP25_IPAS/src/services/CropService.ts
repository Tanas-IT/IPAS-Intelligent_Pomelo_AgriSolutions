import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CropRequest,
  GetCrop2,
  GetCropDetail,
  GetCropSelect,
  GetData,
} from "@/payloads";
import { CropResponse, GetCrop, GetLandPlotOfCrop } from "@/payloads";
import { buildParams } from "@/utils";

export const getCrops = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<CropResponse>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("crops/user-farm", { params });
  const apiResponse = res.data as ApiResponse<GetData<CropResponse>>;
  return apiResponse.data as GetData<CropResponse>;
};

export const getCropsOfFarm = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetCrop2>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("crops/get-crop-of-farm", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetCrop2>>;
  return apiResponse.data as GetData<GetCrop2>;
};

export const getCropOfFarm = async (cropId: number): Promise<ApiResponse<GetCropDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`crops/${cropId}`);
  const apiResponse = res.data as ApiResponse<GetCropDetail>;
  return apiResponse;
};

export const getCropsOfFarmSelect = async () => {
  const res = await axiosAuth.axiosJsonRequest.get(`crops/for-selected/crop-of-farm`);
  const apiResponse = res.data as ApiResponse<GetCropSelect[]>;
  return apiResponse;
};

export const deleteCrop = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`crops/delete-softed/${ids}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateCrop = async (crop: CropRequest): Promise<ApiResponse<GetCrop2>> => {
  const payload = {
    cropId: crop.cropId,
    cropName: crop.cropName,
    startDate: crop.startDate,
    endDate: crop.endDate,
    cropExpectedTime: crop.cropExpectedTime,
    cropActualTime: crop.cropActualTime,
    harvestSeason: crop.harvestSeason,
    estimateYield: crop.estimateYield,
    actualYield: crop.actualYield,
    marketPrice: crop.marketPrice,
    status: crop.status,
    notes: crop.notes,
  };

  const res = await axiosAuth.axiosJsonRequest.put("crops", payload);
  const apiResponse = res.data as ApiResponse<GetCrop2>;
  return apiResponse;
};

export const createCrop = async (crop: CropRequest): Promise<ApiResponse<GetCrop2>> => {
  const payload = {
    cropName: crop.cropName,
    cropExpectedTime: crop.cropExpectedTime,
    startDate: crop.startDate,
    endDate: crop.endDate,
    harvestSeason: crop.harvestSeason,
    estimateYield: crop.estimateYield,
    notes: crop.notes,
    landPlotId: crop.landPlotCrops,
  };

  const res = await axiosAuth.axiosJsonRequest.post(`crops`, payload);
  const apiResponse = res.data as ApiResponse<GetCrop2>;
  return apiResponse;
};

export const getCropsOfFarmForSelect = async (farmId: string) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `crops/get-crop-of-farm-selected?farmId=${farmId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCrop[]>;

  return apiResponse.data.map(({ cropId, cropName }) => ({
    cropId,
    cropName,
  }));
};

export const getCropsOfLandPlotForSelect = async (landplotId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `crops/get-crop-of-landplot-selected?landplotId=${landplotId}`,
  );
  const apiResponse = res.data as ApiResponse<GetCrop[]>;

  return apiResponse.data.map(({ cropId, cropName }) => ({
    cropId,
    cropName,
  }));
};

export const getCropsInCurrentTime = async () => {
  const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-in-current-time`);
  const apiResponse = res.data as ApiResponse<CropResponse[]>;
  return apiResponse;
};

export const getLandPlotOfCrop = async (cropId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`crops/get-landPlot-of-crop/${cropId}`);
  const apiResponse = res.data as ApiResponse<GetLandPlotOfCrop[]>;
  return apiResponse;
};
