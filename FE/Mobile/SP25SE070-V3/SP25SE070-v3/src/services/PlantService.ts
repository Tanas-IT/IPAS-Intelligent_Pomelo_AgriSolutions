import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetPlantDetail,
  GetPlantGrowthHistory,
  GetPlantRecord,
  PlantGrowthHistoryRequest,
} from "@/payloads";
import { GraftedPlant, HarvestStatisticResponse } from "@/types";
import { AvailableHarvest, CreateHarvestRecordRequest, HarvestRecord } from "@/types/harvest";

export const getPlant = async (
  plantId: number
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const getPlantGrowthHistory = async (
  plantId: number,
  pageSize: number,
  pageIndex: number,
  createFrom?: string,
  createTo?: string
): Promise<ApiResponse<GetData<GetPlantGrowthHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    "plant-growth-history/pagin",
    {
      params: {
        plantId,
        pageSize,
        pageIndex,
        createFrom,
        createTo,
      },
    }
  );
  const apiResponse = res.data as ApiResponse<GetData<GetPlantGrowthHistory>>;
  return apiResponse;
};

export const createPlantGrowthHistory = async (
  req: PlantGrowthHistoryRequest
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("PlantId", req.plantId.toString());
  formData.append("UserId", req.userId || "");
  formData.append("IssueName", req.issueName || "");
  formData.append("Content", req.content);

  if (req.images && req.images.length > 0) {
    req.images.forEach((fileResource, index) => {
      const format = fileResource.type.split("/")[1] || "jpeg";
      formData.append(`PlantResources[${index}].fileFormat`, format);
      formData.append(
        `PlantResources[${index}].file`,
        {
          uri: fileResource.uri,
          type: fileResource.type,
          name: fileResource.name,
        } as any,
        fileResource.name
      );
    });
  }
  console.log("payload add gr his", formData);
  

  const res = await axiosAuth.axiosMultipartNoErrorHandler.post(
    "plant-growth-history",
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deletePlantGrowthHistory = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`plant-growth-history/${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getPlantRecordHarvest = async (
  plantId: number,
  pageSize: number,
  pageIndex: number,
  dateHarvestFrom?: string,
  dateHarvestTo?: string,
  productIds?: number,
  totalQuantityFrom?: number | null,
  totalQuantityTo?: number | null,
): Promise<ApiResponse<GetData<HarvestRecord>>> => {
  const res = await axiosAuth.axiosJsonRequest.get("harvests/plants/record", {
    params: {
      plantId,
      pageSize,
      pageIndex,
      dateHarvestFrom,
      dateHarvestTo,
      productIds,
      totalQuantityFrom: totalQuantityFrom ?? undefined,
      totalQuantityTo: totalQuantityTo ?? undefined,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<HarvestRecord>>;
  return apiResponse;
};

export const getAvailableHarvestsForPlant = async ( plantId: number ): Promise<ApiResponse<AvailableHarvest[]>> => {
  const res = await axiosAuth.axiosJsonNoErrorHandler.get(`harvests/plants/can-harvert?PlantId=${plantId}`);
  return res.data as ApiResponse<AvailableHarvest[]>;
};

export const createPlantHarvestRecord = async (
  data: CreateHarvestRecordRequest
): Promise<ApiResponse<null>> => {
  try {
    const res = await axiosAuth.axiosJsonRequest.post("harvests/plants/record", data);
    return res.data as ApiResponse<null>;
  } catch (error: any) {
    console.error("record error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getGraftedPlantsByPlant = async (
  plantId: number,
  params: {
    graftedDateFrom?: string;
    graftedDateTo?: string;
    pageIndex: number;
    pageSize: number;
    searchKey?: string;
    sortBy?: string;
    direction?: string;
  }
): Promise<ApiResponse<GetData<GraftedPlant>>> => {
  const res = await axiosAuth.axiosJsonRequest.get("grafted-plant/get-all-by-plant", {
    params: {
      PlantId: plantId,
      GraftedDateFrom: params.graftedDateFrom,
      GraftedDateTo: params.graftedDateTo,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      searchKey: params.searchKey,
      sortBy: params.sortBy,
      direction: params.direction,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<GraftedPlant>>;
  return apiResponse;
};

export const getHarvestStatistics = async (
  plantId: number,
  params: {
    yearFrom: number | string;
    yearTo: number | string;
    productId: number | string;
  }
): Promise<ApiResponse<HarvestStatisticResponse>> => {
  const res = await axiosAuth.axiosJsonRequest.get("harvests/statistic/plant-in-year", {
    params: {
      plantId,
      yearFrom: params.yearFrom,
      yearTo: params.yearTo,
      productId: params.productId,
    },
  });
  const apiResponse = res.data as ApiResponse<HarvestStatisticResponse>;
  return apiResponse;
};