import { axiosAuth } from "@/api";
import {
  ApiResponse,
  CreateFarmDocumentRequest,
  FarmRequest,
  GetFarmDocuments,
  GetFarmInfo,
  GetFarmPicker,
} from "@/payloads";
import { getUserId } from "@/utils";

export const getFarmsOfUser = async (): Promise<ApiResponse<GetFarmPicker[]>> => {
  const userId = getUserId();
  const res = await axiosAuth.axiosJsonRequest.get(`farms/get-farm-of-user/${userId}`);
  const apiResponse = res.data as ApiResponse<GetFarmPicker[]>;
  return apiResponse;
};

export const getFarm = async (farmId: string): Promise<ApiResponse<GetFarmInfo>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`farms/${farmId}`);
  const apiResponse = res.data as ApiResponse<GetFarmInfo>;
  return apiResponse;
};

export const updateFarmInfo = async (farm: FarmRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put("farms/update-farm-info", farm);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateFarmLogo = async (image: File): Promise<ApiResponse<{ logoUrl: string }>> => {
  const formData = new FormData();
  formData.append("FarmLogo", image);
  const res = await axiosAuth.axiosMultipartForm.patch("farms/update-farm-logo", formData);
  const apiResponse = res.data as ApiResponse<{ logoUrl: string }>;
  return apiResponse;
};

export const getFarmDocuments = async (
  farmId: string,
): Promise<ApiResponse<GetFarmDocuments[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `legal-documents/get-legal-document-of-farm/${farmId}`,
  );
  const apiResponse = res.data as ApiResponse<GetFarmDocuments[]>;
  return apiResponse;
};

export const createFarmDocuments = async (
  doc: CreateFarmDocumentRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("LegalDocumentType", doc.legalDocumentType);
  formData.append("LegalDocumentName", doc.legalDocumentName);

  if (doc.resources && doc.resources.length > 0) {
    doc.resources.forEach((fileResource, index) => {
      formData.append(`Resources[${index}].fileFormat`, fileResource.file.type);
      formData.append(`Resources[${index}].file`, fileResource.file);
    });
  }
  const res = await axiosAuth.axiosMultipartForm.post(`legal-documents`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteFarmDocuments = async (docId: string): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`legal-documents/${docId}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateFarmDocuments = async (
  doc: CreateFarmDocumentRequest,
): Promise<ApiResponse<Object>> => {
  const formData = new FormData();
  formData.append("LegalDocumentType", doc.legalDocumentType);
  formData.append("LegalDocumentName", doc.legalDocumentName);

  if (doc.resources && doc.resources.length > 0) {
    doc.resources.forEach((fileResource, index) => {
      formData.append(`Resources[${index}].fileFormat`, fileResource.file.type);
      formData.append(`Resources[${index}].file`, fileResource.file);
    });
  }
  const res = await axiosAuth.axiosMultipartForm.post(`legal-documents`, formData);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
