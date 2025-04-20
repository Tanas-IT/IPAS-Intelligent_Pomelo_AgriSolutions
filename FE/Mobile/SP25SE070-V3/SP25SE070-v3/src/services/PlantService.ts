import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetPlant,
  GetPlantDetail,
  GetPlantGrowthHistory,
  GetPlantRecord,
  PlantGrowthHistoryRequest,
  PlantRequest,
} from "@/payloads";
import { GraftedPlant, HarvestStatisticResponse } from "@/types";
import {
  AvailableHarvest,
  CreateHarvestRecordRequest,
  HarvestRecord,
} from "@/types/harvest";

export const getPlant = async (
  plantId: number
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const updatePlantStatus = async (
  plant: PlantRequest
): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.put("plants", plant);
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
  formData.append("UserId", req.userId);
  formData.append("IssueName", req.issueName);
  formData.append("Content", req.content);

  const allResources = [...(req.images || []), ...(req.videos || [])];
  allResources.forEach((file, i) => {
    const format = file.type.split("/")[1] || "jpeg";
    formData.append(`PlantResources[${i}].fileFormat`, format);
    formData.append(`PlantResources[${i}].file`, file as any, file.name);
  });

  const res = await axiosAuth.axiosMultipartForm.post(
    "plant-growth-history",
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePlantGrowthHistory = async (
  req: PlantGrowthHistoryRequest
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("PlantGrowthHistoryId", req.plantGrowthHistoryId.toString());
  formData.append("UserId", req.userId);
  formData.append("IssueName", req.issueName);
  formData.append("Content", req.content);

  const allResources = [...(req.images || []), ...(req.videos || [])];
  allResources.forEach((file, i) => {
    if (file.id) {
      formData.append(`Resource[${i}].resourceID`, file.id.toString());
      const format = file.type.split("/")[1] || "jpeg";
      formData.append(`Resource[${i}].fileFormat`, format);
      formData.append(`Resource[${i}].file`, file as any, file.name);
    } else {
      const format = file.type.split("/")[1] || "jpeg";
      formData.append(`Resource[${i}].fileFormat`, format);
      formData.append(`Resource[${i}].file`, file as any, file.name);
    }
  });

  const res = await axiosAuth.axiosMultipartForm.put(
    "plant-growth-history",
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deletePlantGrowthHistory = async (
  id: number
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(
    `plant-growth-history/${id}`
  );
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
  totalQuantityTo?: number | null
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

export const getAvailableHarvestsForPlant = async (
  plantId: number
): Promise<ApiResponse<AvailableHarvest[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `harvests/plants/can-harvert?PlantId=${plantId}`
  );
  return res.data as ApiResponse<AvailableHarvest[]>;
};

export const createPlantHarvestRecord = async (
  data: CreateHarvestRecordRequest
): Promise<ApiResponse<null>> => {
  const res = await axiosAuth.axiosJsonRequest.post(
    "harvests/plants/record",
    data
  );
  return res.data as ApiResponse<null>;
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
  const res = await axiosAuth.axiosJsonRequest.get(
    "grafted-plant/get-all-by-plant",
    {
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
    }
  );
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
  const res = await axiosAuth.axiosJsonRequest.get(
    "harvests/statistic/plant-in-year",
    {
      params: {
        plantId,
        yearFrom: params.yearFrom,
        yearTo: params.yearTo,
        productId: params.productId,
      },
    }
  );
  const apiResponse = res.data as ApiResponse<HarvestStatisticResponse>;
  return apiResponse;
};

export const updateProductHarvest = async (
  productHarvestHistoryId: number,
  yieldUpdate: number
): Promise<ApiResponse<Object>> => {
  const payload = {
    productHarvestHistoryId: productHarvestHistoryId,
    quantity: yieldUpdate,
  };
  const res = await axiosAuth.axiosJsonRequest.put(
    `harvests/update-product-harvest`,
    payload
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteRecordHarvest = async (
  id: number
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(
    `harvests/delete-plant-record`,
    {
      data: { productHarvestHistoryId: [id] },
    }
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
