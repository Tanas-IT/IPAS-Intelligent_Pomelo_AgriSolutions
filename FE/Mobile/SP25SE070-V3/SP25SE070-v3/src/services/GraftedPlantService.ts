import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CreateGraftedPlantsRequest,
  GetData,
  GetGraftedGrowthHistory,
  GetGraftedPlant,
  GetGraftedPlantDetail,
  GetGraftedPlantHistory,
  GetGraftedPlantSelected,
  GraftedGrowthHistoryRequest,
  GraftedPlantRequest,
} from "@/payloads";
import { getFileFormat, getUserId } from "@/utils";

export const getGraftedPlantGrowthHistory = async (
  graftedPlantId: number,
  pageSize: number,
  pageIndex: number,
  createFrom?: string,
  createTo?: string
): Promise<ApiResponse<GetData<GetGraftedGrowthHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get("grafted-plant/note/pagin", {
    params: {
      graftedPlantId,
      pageSize,
      pageIndex,
      createFrom,
      createTo,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedGrowthHistory>>;
  return apiResponse;
};

export const getGraftedPlantSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `grafted-plant/get-for-selected/${farmId}`
  );
  const apiResponse = res.data as ApiResponse<GetGraftedPlantSelected[]>;

  return apiResponse;
};

export const getGraftedPlant = async (
  id: number
): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/${id}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const getGraftedPlantHistory = async (
  plantId: number,
  pageIndex: number,
  GraftedDateFrom?: string,
  GraftedDateTo?: string
): Promise<ApiResponse<GetData<GetGraftedPlantHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `/grafted-plant/get-by-plant`,
    {
      params: {
        plantId,
        pageIndex,
        GraftedDateFrom,
        GraftedDateTo,
      },
    }
  );
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedPlantHistory>>;
  return apiResponse;
};

export const createGraftedPlants = async (
  req: CreateGraftedPlantsRequest
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`grafted-plant`, req);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteGraftedPlants = async (
  ids: number[] | string[]
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(
    `grafted-plant/softed-delete`,
    ids
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateGraftedPlantStatus = async (
  graftedPlant: GraftedPlantRequest
): Promise<ApiResponse<GetGraftedPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put(
    "grafted-plant",
    graftedPlant
  );
  const apiResponse = res.data as ApiResponse<GetGraftedPlant>;
  return apiResponse;
};

export const createGraftedPlantGrowthHistory = async (
  req: GraftedGrowthHistoryRequest
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("GraftedPlantId", req.graftedPlantId.toString());
  formData.append("UserId", req.userId.toString());
  formData.append("IssueName", req.issueName);
  formData.append("Content", req.content);

  const allResources = [...(req.images || []), ...(req.videos || [])];
  allResources.forEach((file, i) => {
    const format = file.type.split("/")[1] || "jpeg";
    formData.append(`PlantResources[${i}].fileFormat`, format);
    formData.append(`PlantResources[${i}].file`, file as any, file.name);
  });

  const res = await axiosAuth.axiosMultipartForm.post(
    `grafted-plant/note`,
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateGraftedPlantGrowthHistory = async (
  req: GraftedGrowthHistoryRequest
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("GraftedPlantNoteId", req.graftedPlantNoteId.toString());
  formData.append("UserId", req.userId.toString());
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
    `grafted-plant/note`,
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteGraftedPlantGrowthHistory = async (
  id: number
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(
    `grafted-plant/note/${id}`
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
