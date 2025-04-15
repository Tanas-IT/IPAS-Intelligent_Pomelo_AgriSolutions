import { Images } from "@/assets";
import {
  GetFarmDocuments,
  GetFarmInfo,
  GetPlant,
  LandPlotRequest,
  GetPlantDetail,
} from "@/payloads";
import { GetPlan } from "@/payloads/plan";
import {
  CoordsState,
  FilterConfigTypeState,
  FilterCriteriaState,
  FilterCropState,
  FilterEmployeeState,
  FilterGraftedPlantState,
  FilterHarvestDayState,
  FilterLandRowState,
  FilterMasterTypeState,
  FilterPartnerState,
  FilterPlantLotState,
  FilterPlantState,
  FilterUserState,
  LogoState,
} from "@/types";

export const getDefaultFarm = (): GetFarmInfo => ({
  farmCode: "",
  farmId: 0,
  farmName: "",
  farmLogo: undefined,
  logoUrl: "",
  address: "",
  provinceId: "",
  province: "",
  districtId: "",
  district: "",
  wardId: "",
  ward: "",
  description: "",
  area: "",
  length: "",
  width: "",
  soilType: "",
  climateZone: "",
  createDate: new Date(),
  status: "Inactive",
  longitude: 0,
  latitude: 0,
  farmExpiredDate: "",
  owner: {
    email: "",
    fullName: "",
    phoneNumber: "",
  },
});

export const defaultLogoFarm: LogoState = {
  logo: null,
  logoUrl: "",
};

export const defaultCoordsFarm: CoordsState = {
  longitude: 106.6825,
  latitude: 10.7626,
};

// export const defaultPlanData: GetPlan = {
//   planId: 1,
//   planName: "Initial Planting",
//   status: "Active",
//   planCode: "P-001",
//   createDate: new Date("2023-01-01"),
//   startDate: new Date("2023-01-01"),
//   endDate: new Date("2023-12-01"),
//   updateDate: new Date("2023-12-01"),
//   isActive: true,
//   notes: "Initial planting process for Pomelo trees.",
//   planDetail: "Planting Pomelo trees with required spacing and soil preparation.",
//   responsibleBy: ["1", "2"],
//   frequency: "weekly",
//   landPlot: 1001,
//   assignorId: "11",
//   pesticideName: "Pesticide A",
//   maxVolume: 50,
//   minVolume: 10,
//   processId: "Caring",
//   cropId: "pomelo",
//   growthStageId: "stage",
//   isDelete: false,
//   masterTypeId: "planting",
//   farmId: "F-001",
//   startTime: new Date("2023-01-01T08:00:00"),
//   endTime: new Date("2023-01-01T17:00:00"),
//   daysOfWeek: [1, 2, 3, 4, 5],
//   daysOfMonth: [],
//   customDates: [],
// };

export const DEFAULT_MASTER_TYPE_FILTERS: FilterMasterTypeState = {
  createDateFrom: "",
  createDateTo: "",
  isActive: null,
};

export const DEFAULT_CONFIG_FILTERS: FilterConfigTypeState = {
  isActive: null,
};

export const DEFAULT_USER_FILTERS: FilterUserState = {
  createDateFrom: "",
  createDateTo: "",
  dobFrom: "",
  dobTo: "",
  genders: "",
  status: "",
  roleIds: [] as string[],
};

export const DEFAULT_LOT_FILTERS: FilterPlantLotState = {
  importedDateFrom: "",
  importedDateTo: "",
  partnerId: [] as string[],
  status: [] as string[],
  previousQuantityFrom: undefined,
  previousQuantityTo: undefined,
  isFromGrafted: null,
};

export const DEFAULT_CROP_FILTERS: FilterCropState = {
  yearFrom: "",
  yearTo: "",
  harvestSeason: [] as string[],
  actualYieldFrom: undefined,
  actualYieldTo: undefined,
  marketPriceFrom: undefined,
  marketPriceTo: undefined,
  LandPlotIds: [] as string[],
  status: [] as string[],
};

export const DEFAULT_HARVEST_DAY_FILTERS: FilterHarvestDayState = {
  dateHarvestFrom: "",
  dateHarvestTo: "",
  totalPriceFrom: undefined,
  totalPriceTo: undefined,
  status: [] as string[],
};

export const DEFAULT_CRITERIA_FILTERS: FilterCriteriaState = {
  createDateFrom: "",
  createDateTo: "",
  target: [] as string[],
  isActive: null,
};

export const DEFAULT_PLANT_FILTERS: FilterPlantState = {
  plantingDateFrom: "",
  plantingDateTo: "",
  landPlotIds: [] as string[],
  landRowIds: [] as string[],
  cultivarIds: [] as string[],
  growthStageIds: [] as string[],
  healthStatus: [] as string[],
  isLocated: null,
  isDead: null,
  isPassed: null,
};

export const DEFAULT_GRAFTED_PLANT_FILTERS: FilterGraftedPlantState = {
  plantIds: [] as string[],
  plantLotIds: [] as string[],
  separatedDateFrom: "",
  separatedDateTo: "",
  status: [] as string[],
  cultivarIds: [] as string[],
  graftedDateFrom: "",
  graftedDateTo: "",
  isCompleted: null,
};

export const DEFAULT_LAND_ROW_FILTERS: FilterLandRowState = {
  rowIndexFrom: undefined,
  rowIndexTo: undefined,
  treeAmountFrom: undefined,
  treeAmountTo: undefined,
};

export const DEFAULT_EMPLOYEE_FILTERS: FilterEmployeeState = {
  roleName: [] as string[],
};

export const DEFAULT_PARTNER_FILTERS: FilterPartnerState = {
  major: [] as string[],
};

// export const DEFAULT_ROW = (): rowStateType => ({
//   id: 0,
//   length: 200,
//   width: 50,
//   plantsPerRow: 10,
//   plantSpacing: 5,
//   index: 0,
// });

export const DEFAULT_LAND_PLOT = (): LandPlotRequest => ({
  landPlotId: "",
  landPlotCode: "",
  landPlotName: "",
  area: 0,
  plotLength: 0,
  plotWidth: 0,
  soilType: "",
  description: "",
  targetMarket: "",
  numberOfRows: 0,
  lineSpacing: 0,
  isRowHorizontal: true,
  rowPerLine: 0,
  rowSpacing: 0,
  minLength: 0,
  maxLength: 0,
  minWidth: 0,
  maxWidth: 0,
  landPlotCoordinations: [],
  landRows: [],
});

export const DEFAULT_PLANT: GetPlantDetail = {
  plantId: 0,
  plantCode: "",
  plantName: "", // Không bắt buộc nên để trống
  plantIndex: 0,
  healthStatus: "",
  createDate: new Date(),
  plantingDate: "",
  description: "",
  masterTypeName: "",
  growthStageName: "",
  imageUrl: "",
  rowIndex: 0,
  landPlotName: "",
  characteristic: "",
  landPlotId: 0,
  landRowId: 0,
  masterTypeId: 0,
  isDead: false,
  isPassed: false,
  plantReferenceCode: "",
  plantReferenceId: 0,
  passedDate: "",
  plantLotName: "",
  plantReferenceName: "",
};
