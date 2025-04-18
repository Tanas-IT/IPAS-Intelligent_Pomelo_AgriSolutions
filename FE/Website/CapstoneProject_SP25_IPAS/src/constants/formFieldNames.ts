import {
  GetGraftedPlant,
  GetGrowthStage,
  GetMasterType,
  GetPartner,
  GetPlant,
  GetPlantGrowthHistory,
  GetPlantLot2,
  GetSystemConfig,
  GetUser2,
  MasterTypeDetail,
  UpdateProductHarvestRequest,
} from "@/payloads";

export const userFormFields = {
  userId: "userId",
  userCode: "userCode",
  email: "email",
  fullName: "fullName",
  gender: "gender",
  dob: "dob",
  phoneNumber: "phoneNumber",
  createDate: "createDate",
  status: "status",
  roleName: "roleName",
  avatarURL: "avatarURL",
  password: "password",
};

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
  isPassed: "isPassed",
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
  targetDisplay: "targetDisplay",
  isConflict: "isConflict",
  createDate: "createDate",
  minTime: "minTime",
  maxTime: "maxTime",
  isActive: "isActive",
  masterTypeDetailModels: "masterTypeDetailModels",
};

export const configFormFields: Record<keyof GetSystemConfig, keyof GetSystemConfig> = {
  configId: "configId",
  configGroup: "configGroup",
  configKey: "configKey",
  configValue: "configValue",
  description: "description",
  isActive: "isActive",
  isDeleteable: "isDeleteable",
  createDate: "createDate",
  referenceKeyId: "referenceKeyId",
};

export const lotFormFields: Record<keyof GetPlantLot2, keyof GetPlantLot2> = {
  plantLotId: "plantLotId",
  plantLotCode: "plantLotCode",
  plantLotName: "plantLotName",
  unit: "unit",
  previousQuantity: "previousQuantity",
  inputQuantity: "inputQuantity",
  lastQuantity: "lastQuantity",
  usedQuantity: "usedQuantity",
  status: "status",
  importedDate: "importedDate",
  note: "note",
  masterTypeId: "masterTypeId",
  isFromGrafted: "isFromGrafted",
  isPassed: "isPassed",
  seedingName: "seedingName",
  partnerId: "partnerId",
  partnerName: "partnerName",
};

export const cropFormFields = {
  cropId: "cropId",
  cropName: "cropName",
  startDate: "startDate",
  endDate: "endDate",
  duration: "duration",
  cropExpectedTime: "cropExpectedTime",
  cropActualTime: "cropActualTime",
  harvestSeason: "harvestSeason",
  estimateYield: "estimateYield",
  actualYield: "actualYield",
  status: "status",
  notes: "notes",
  marketPrice: "marketPrice",
  landPlotCrops: "landPlotCrops",
};

export const harvestFormFields = {
  cropId: "cropId",
  dateHarvest: "dateHarvest",
  harvestHistoryNote: "harvestHistoryNote",
};

export const updateProductHarvestFormFields: Record<
  keyof UpdateProductHarvestRequest,
  keyof UpdateProductHarvestRequest
> = {
  productHarvestHistoryId: "productHarvestHistoryId",
  unit: "unit",
  sellPrice: "sellPrice",
  costPrice: "costPrice",
  quantity: "quantity",
  userId: "userId",
};

export const graftedPlantFormFields: Record<keyof GetGraftedPlant, keyof GetGraftedPlant> = {
  graftedPlantId: "graftedPlantId",
  graftedPlantCode: "graftedPlantCode",
  graftedPlantName: "graftedPlantName",
  separatedDate: "separatedDate",
  status: "status",
  graftedDate: "graftedDate",
  note: "note",
  cultivarId: "cultivarId",
  cultivarName: "cultivarName",
  isCompleted: "isCompleted",
  plantLotId: "plantLotId",
  plantCode: "plantCode",
  plantLotName: "plantLotName",
  plantName: "plantName",
  isDead: "isDead",
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

export const plantGrowthHistoryFormFields: Record<
  keyof GetPlantGrowthHistory,
  keyof GetPlantGrowthHistory
> = {
  plantId: "plantId",
  plantGrowthHistoryId: "plantGrowthHistoryId",
  plantGrowthHistoryCode: "plantGrowthHistoryCode",
  issueName: "issueName",
  content: "content",
  createDate: "createDate",
  numberImage: "numberImage",
  numberVideos: "numberVideos",
  resources: "resources",
  noteTakerName: "noteTakerName",
  noteTakerAvatar: "noteTakerAvatar",
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
  dateWork: "dateWork",
  time: "time",
  responsibleBy: "responsibleBy",
  assignorId: "assignorId",
  type: "type",
  planId: "planId",
  masterTypeId: "masterTypeId",
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
  notes: "notes",
  listLandPlotOfCrop: "listLandPlotOfCrop",
  planTarget: "planTarget",
  plantLot: "plantLot",
  graftedPlant: "graftedPlant",
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
  planTarget: "planTarget",
  plantLot: "plantLot",
  graftedPlant: "graftedPlant",
};
