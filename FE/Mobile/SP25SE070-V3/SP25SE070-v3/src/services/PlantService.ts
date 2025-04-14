import { axiosAuth } from "@/api";
import {
  ApiResponse,
  GetData,
  GetPlantDetail,
  GetPlantGrowthHistory,
  PlantGrowthHistoryRequest,
} from "@/payloads";

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

  const res = await axiosAuth.axiosMultipartNoErrorHandler.post(
    "plant-growth-history",
    formData
  );
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};