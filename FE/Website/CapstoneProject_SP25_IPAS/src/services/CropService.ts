import { axiosAuth } from "@/api";
import { ApiResponse, GetData } from "@/payloads";
import { CropResponse, GetCrop, GetCrop2, GetLandPlotOfCrop } from "@/payloads";
import { buildParams, getFarmId } from "@/utils";

export const getCrops = async (
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
  const res = await axiosAuth.axiosJsonRequest.get("crops/user-farm", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetCrop2>>;
  return apiResponse.data as GetData<GetCrop2>;
};

// export const getCropsOfFarm = async () => {
//   const farmId = getFarmId();
//   const res = await axiosAuth.axiosJsonRequest.get(`crops/get-crop-of-farm`, { params: farmId });
// };

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
