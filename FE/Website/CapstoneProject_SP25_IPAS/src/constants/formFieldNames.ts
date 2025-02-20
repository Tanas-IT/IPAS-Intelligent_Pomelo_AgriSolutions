import { GetMasterType, MasterTypeDetail } from "@/payloads";

export const farmFormFields = {
  farmName: "farmName",
  description: "description",
  province: "province",
  district: "district",
  ward: "ward",
  address: "address",
  area: "area",
  length: "length",
  width: "width",
  soilType: "soilType",
  climateZone: "climateZone",
  logo: "logo",
  logoUrl: "logoUrl",
  createDate: "createDate",
};

export const farmDocumentFormFields = {
  documentId: "documentId",
  documentName: "documentName",
  documentType: "documentType",
  documents: "documents",
};

export const masterTypeFormFields: Record<keyof GetMasterType, keyof GetMasterType> = {
  masterTypeId: "masterTypeId",
  masterTypeCode: "masterTypeCode",
  masterTypeName: "masterTypeName",
  masterTypeDescription: "masterTypeDescription",
  backgroundColor: "backgroundColor",
  textColor: "textColor",
  characteristic: "characteristic",
  typeName: "typeName",
  createDate: "createDate",
  isActive: "isActive",
  masterTypeDetailModels: "masterTypeDetailModels",
};

export const worklogFormFields = {
  worklogName: "worklogName",
  processId: "processId",
  cropId: "cropId",
  landPlotId: "plantPlotId",
  status: "status",
  notes: "notes",
  date: "date",
  time: "time",
  responsibleBy: "responsibleBy",
  assignorId: "assignorId",
  type: "type",
};

export const feedbackFormFields = {
  content: "content",
  managerId: "managerId",
  worklogId: "worklogId",
  worklogStatus: "worklogStatus",
};
