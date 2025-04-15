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
import { buildParams, getFileFormat, getUserId } from "@/utils";

export const getGraftedPlantSelect = async (farmId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/get-for-selected/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantSelected[]>;

  return apiResponse;
};

export const getGraftedPlants = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetGraftedPlant>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("grafted-plant", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedPlant>>;
  return apiResponse.data as GetData<GetGraftedPlant>;
};

export const getGraftedPlant = async (id: number): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`grafted-plant/${id}`);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const getGraftedPlantHistory = async (
  plantId: number,
  pageIndex: number,
  GraftedDateFrom?: string,
  GraftedDateTo?: string,
): Promise<ApiResponse<GetData<GetGraftedPlantHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`/grafted-plant/get-by-plant`, {
    params: {
      plantId,
      pageIndex,
      GraftedDateFrom,
      GraftedDateTo,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<GetGraftedPlantHistory>>;
  return apiResponse;
};

export const createGraftedPlants = async (
  req: CreateGraftedPlantsRequest,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`grafted-plant`, req);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteGraftedPlants = async (
  ids: number[] | string[],
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`grafted-plant/softed-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateGraftedPlant = async (
  graftedPlant: GraftedPlantRequest,
): Promise<ApiResponse<GetGraftedPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put("grafted-plant", graftedPlant);
  const apiResponse = res.data as ApiResponse<GetGraftedPlant>;
  return apiResponse;
};

export const updateGraftedPlantDead = async (id: number): Promise<ApiResponse<GetGraftedPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`grafted-plant/mark-dead`, [id]);
  const apiResponse = res.data as ApiResponse<GetGraftedPlant>;
  return apiResponse;
};

export const updateIsCompletedAndCutting = async (
  graftedPlantId: number,
  plantLotId?: number,
): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const payload: Record<string, any> = { graftedPlantId };
  if (plantLotId) payload.plantLotId = plantLotId;

  const res = await axiosAuth.axiosJsonRequest.put("grafted-plant/completed-and-cutting", payload);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const groupGraftedPlant = async (
  graftedPlantIds: number[],
  plantLotId: number,
): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const payload: Record<string, any> = { graftedPlantIds, plantLotId };

  const res = await axiosAuth.axiosJsonRequest.put("grafted-plant/grouping", payload);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const unGroupGraftedPlant = async (
  graftedPlantIds: number[],
): Promise<ApiResponse<GetGraftedPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.put("grafted-plant/ungrouping", graftedPlantIds);
  const apiResponse = res.data as ApiResponse<GetGraftedPlantDetail>;
  return apiResponse;
};

export const convertToPlant = async (
  graftedId: number,
  landRowId: number,
  plantIndex: number,
): Promise<ApiResponse<Object>> => {
  const payload = {
    graftedId,
    landRowId,
    plantIndex,
  };
  const res = await axiosAuth.axiosJsonRequest.post("grafted-plant/create-plant", payload);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getGraftedPlantGrowthHistory = async (
  graftedPlantId: number,
  pageSize: number,
  pageIndex: number,
  createFrom?: string,
  createTo?: string,
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

export const createGraftedPlantGrowthHistory = async (
  req: GraftedGrowthHistoryRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("GraftedPlantId", req.graftedPlantId.toString());
  formData.append("UserId", getUserId());
  formData.append("IssueName", req.issueName);
  formData.append("Content", req.content);

  if (req.resources && req.resources.length > 0) {
    req.resources.forEach((fileResource, index) => {
      if (fileResource instanceof File) {
        const format = getFileFormat(fileResource.type);
        if (format) {
          formData.append(`PlantResources[${index}].fileFormat`, format);
          formData.append(`PlantResources[${index}].file`, fileResource);
        }
      }
    });
  }
  const res = await axiosAuth.axiosMultipartForm.post(`grafted-plant/note`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteGraftedPlantGrowthHistory = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`grafted-plant/note/${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const exportGraftedPlantGrowthHistory = async (
  id: number,
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `grafted-plant/note/export-csv?graftedPlantId=${id}`,
    { responseType: "blob" },
  );

  const disposition = res.headers["content-disposition"] || "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
  const filename = match ? decodeURIComponent(match[1]) : "export.csv";

  return { blob: res.data, filename };
};
