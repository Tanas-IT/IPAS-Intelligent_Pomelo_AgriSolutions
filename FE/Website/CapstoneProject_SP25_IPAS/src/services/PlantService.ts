import { axiosAuth } from "@/api";
import { GROWTH_ACTIONS } from "@/constants";
import {
  ApiResponse,
  GetData,
  GetPlant,
  GetPlantDetail,
  GetPlantGrowthHistory,
  GetPlantOfRowSelect,
  GetPlantRecord,
  GetPlantSelect,
  PlantGrowthHistoryRequest,
  PlantRequest,
} from "@/payloads";
import { FileResource } from "@/types";
import {
  buildParams,
  extractFilenameFromHeader,
  getFarmId,
  getFileFormat,
  getUserId,
} from "@/utils";

export const getPlants = async (landRowId: number): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-plant-of-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};

export const getPlantList = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlant>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("plants/get-plants-pagin", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetPlant>>;
  return apiResponse.data as GetData<GetPlant>;
};

export const getPlant = async (plantId: number): Promise<ApiResponse<GetPlantDetail>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlantDetail>;
  return apiResponse;
};

export const deletePlants = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plants/soft-delete`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePlant = async (plant: PlantRequest): Promise<ApiResponse<GetPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.put("plants", plant);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const createPlant = async (plant: PlantRequest): Promise<ApiResponse<GetPlant>> => {
  const formData = new FormData();
  Object.entries(plant).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      const fieldName = key === "plantReferenceId" ? "MotherPlantId" : key;
      formData.append(fieldName, value instanceof File ? value : value.toString());
    }
  });

  const res = await axiosAuth.axiosMultipartForm.post(`plants`, formData);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const importPlants = async (file: File): Promise<ApiResponse<GetPlant>> => {
  const formData = new FormData();
  formData.append("fileExcel", file);
  formData.append("skipDuplicate", "false");

  const res = await axiosAuth.axiosMultipartForm.post(`plants/import-excel`, formData);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const getMotherPlantSelect = async (): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `plants/get-for-selected/growth-stage-function?activeFunction=${GROWTH_ACTIONS.GRAFTED}`,
  );
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};

export const getPlantNoPositionSelect = async (): Promise<ApiResponse<GetPlant[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-for-selected/not-yet-plant`);
  const apiResponse = res.data as ApiResponse<GetPlant[]>;
  return apiResponse;
};

export const getPlantOfRow = async (landRowId: number) => {
  const res = await axiosAuth.axiosJsonRequest.get(`plants/get-for-selected-by-row/${landRowId}`);
  const apiResponse = res.data as ApiResponse<GetPlantOfRowSelect[]>;
  return apiResponse;
};

export const getPlantOfActiveFunction = async (
  actFunction: string,
  // plotId?: number,
  rowId?: number,
) => {
  const params = new URLSearchParams();
  // if (plotId !== undefined) params.append("plotId", plotId.toString());
  if (rowId !== undefined) params.append("rowId", rowId.toString());
  params.append("actFunction", actFunction);

  const res = await axiosAuth.axiosJsonRequest.get(
    `plants/get-for-selected/active-function?${params.toString()}`,
  );
  const apiResponse = res.data as ApiResponse<GetPlantOfRowSelect[]>;
  return apiResponse;
};

export const updatePlantDead = async (plantId: number): Promise<ApiResponse<GetPlant>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`plants/dead-mark/${plantId}`);
  const apiResponse = res.data as ApiResponse<GetPlant>;
  return apiResponse;
};

export const getPlantOfStageActive = async (
  activeFunction: string,
): Promise<ApiResponse<GetPlantSelect[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `plants/get-for-selected/growth-stage-function?activeFunction=${activeFunction}`,
  );
  const apiResponse = res.data as ApiResponse<GetPlantSelect[]>;
  return apiResponse;
};

export const getPlantGrowthHistory = async (
  plantId: number,
  pageSize: number,
  pageIndex: number,
  createFrom?: string,
  createTo?: string,
): Promise<ApiResponse<GetData<GetPlantGrowthHistory>>> => {
  const res = await axiosAuth.axiosJsonRequest.get("plant-growth-history/pagin", {
    params: {
      plantId,
      pageSize,
      pageIndex,
      createFrom,
      createTo,
    },
  });
  const apiResponse = res.data as ApiResponse<GetData<GetPlantGrowthHistory>>;
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
): Promise<ApiResponse<GetData<GetPlantRecord>>> => {
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
  const apiResponse = res.data as ApiResponse<GetData<GetPlantRecord>>;
  return apiResponse;
};

export const createPlantGrowthHistory = async (
  req: PlantGrowthHistoryRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("PlantId", req.plantId.toString());
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
  const res = await axiosAuth.axiosMultipartForm.post(`plant-growth-history`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updatePlantGrowthHistory = async (
  req: PlantGrowthHistoryRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("PlantGrowthHistoryId", req.plantGrowthHistoryId.toString());
  formData.append("UserId", getUserId());
  formData.append("IssueName", req.issueName);
  formData.append("Content", req.content);

  (req.resources || []).forEach((resource, i) => {
    const isOldFile = (resource as FileResource).resourceID !== undefined;

    if (isOldFile) {
      const fileResource = resource as FileResource;
      formData.append(`Resource[${i}].resourceID`, fileResource.resourceID.toString());
    } else {
      const file = resource as File;
      const format = getFileFormat(file.type);
      if (format) {
        formData.append(`Resource[${i}].fileFormat`, format);
        formData.append(`Resource[${i}].file`, file, file.name);
      }
    }
  });

  const res = await axiosAuth.axiosMultipartForm.put("plant-growth-history", formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deletePlantGrowthHistory = async (id: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`plant-growth-history/${id}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const exportPlantGrowthHistory = async (
  id: number,
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `plant-growth-history/export-csv?plantId=${id}`,
    { responseType: "blob" },
  );

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};

export const exportPlants = async (
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
  const res = await axiosAuth.axiosJsonRequest.get(`plants/export-csv`, {
    params,
    responseType: "blob",
  });

  const filename = extractFilenameFromHeader(res.headers["content-disposition"]);

  return { blob: res.data, filename };
};
