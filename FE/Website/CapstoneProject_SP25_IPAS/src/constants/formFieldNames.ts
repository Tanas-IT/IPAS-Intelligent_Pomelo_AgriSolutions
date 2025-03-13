import {
  GetGrowthStage,
  GetMasterType,
  GetPartner,
  GetPlant,
  GetPlantLot2,
  MasterTypeDetail,
} from "@/payloads";

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

export const plantFormFields: Record<keyof GetPlant, keyof GetPlant> = {
  plantId: "plantId",
  plantCode: "plantCode",
  plantName: "plantName",
  plantIndex: "plantIndex",
  healthStatus: "healthStatus",
  createDate: "createDate",
  plantingDate: "plantingDate",
  plantReferenceId: "plantReferenceId",
  plantReferenceCode: "plantReferenceCode",
  description: "description",
  masterTypeId: "masterTypeId",
  masterTypeName: "masterTypeName",
  growthStageName: "growthStageName",
  imageUrl: "imageUrl",
  landPlotId: "landPlotId",
  landRowId: "landRowId",
  rowIndex: "rowIndex",
  landPlotName: "landPlotName",
  isDead: "isDead",
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
  target: "target",
  isConflict: "isConflict",
  createDate: "createDate",
  isActive: "isActive",
  masterTypeDetailModels: "masterTypeDetailModels",
};

export const lotFormFields: Record<keyof GetPlantLot2, keyof GetPlantLot2> = {
  plantLotId: "plantLotId",
  plantLotCode: "plantLotCode",
  plantLotName: "plantLotName",
  unit: "unit",
  previousQuantity: "previousQuantity",
  lastQuantity: "lastQuantity",
  usedQuantity: "usedQuantity",
  status: "status",
  importedDate: "importedDate",
  note: "note",
  masterTypeId: "masterTypeId",
  isPassed: "isPassed",
  seedingName: "seedingName",
  partnerId: "partnerId",
  partnerName: "partnerName",
};

export const growthStageFormFields: Record<keyof GetGrowthStage, keyof GetGrowthStage> = {
  growthStageId: "growthStageId",
  growthStageCode: "growthStageCode",
  growthStageName: "growthStageName",
  description: "description",
  monthAgeStart: "monthAgeStart",
  monthAgeEnd: "monthAgeEnd",
  createDate: "createDate",
  activeFunction: "activeFunction",
};

export const partnerFormFields: Record<keyof GetPartner, keyof GetPartner> = {
  partnerId: "partnerId",
  partnerCode: "partnerCode",
  partnerName: "partnerName",
  description: "description",
  phoneNumber: "phoneNumber",
  createDate: "createDate",
  major: "major",
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
  status: "status",
  reason: "reason",
};

export const createPlotFormFields = {
  landPlotName: "landPlotName",
  description: "description",
  soilType: "soilType",
  targetMarket: "targetMarket",
  area: "area",
  width: "width",
  length: "length",
  status: "status",
  rowLength: "rowLength",
  rowWidth: "rowWidth",
  numberOfRows: "numberOfRows",
  rowSpacing: "rowSpacing",
  rowsPerLine: "rowsPerLine",
  lineSpacing: "lineSpacing",
  rowOrientation: "rowOrientation",
  plantsPerRow: "plantsPerRow",
  plantSpacing: "plantSpacing",
};

export const rowFormFields = {
  id: "id",
  index: "index",
  width: "width",
  length: "length",
  plantsPerRow: "plantsPerRow",
  plantSpacing: "plantSpacing",
};

export const addPlanFormFields = {
  planName: "planName",
  planDetail: "planDetail",
  cropId: "cropId",
  landPlotId: "landPlotId",
  processId: "processId",
  growthStageID: "growthStageId",
  isActive: "isActive",
  dateRange: "dateRange",
  timeRange: "timeRange",
  dayOfWeek: "dayOfWeek",
  dayOfMonth: "dayOfMonth",
  customDates: "customDates",
  masterTypeId: "masterTypeId",
  listEmployee: "listEmployee",
  frequency: "frequency",
  status: "status",
  assignor: "assignor",
  planNote: "planNote",
};

export const packageFormFields = {
  packageId: "packageId",
  packageName: "packageName",
  packagePrice: "packagePrice",
  duration: "duration",
  isActive: "isActive",
};

export const processFormFields = {
  processName: "processName",
  isActive: "isActive",
  farmId: "farmId",
  masterTypeId: "masterTypeId",
  growthStageId: "growthStageId",
  listPlan: "listPlan",
  isSample: "isSample",
};
