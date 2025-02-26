import { Images } from "@/assets";
import { GetFarmDocuments, GetFarmInfo } from "@/payloads";
import { GetPlan } from "@/payloads/plan";
import { CoordsState, FilterMasterTypeState, LogoState, rowStateType } from "@/types";

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

export const defaultPlanData: GetPlan = {
  planId: "1",
  planName: "Initial Planting",
  status: "Active",
  planCode: "P-001",
  createDate: new Date("2023-01-01"),
  startDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-01"),
  updateDate: new Date("2023-12-01"),
  isActive: true,
  notes: "Initial planting process for Pomelo trees.",
  planDetail: "Planting Pomelo trees with required spacing and soil preparation.",
  responsibleBy: ["1", "2"],
  frequency: "weekly",
  landPlot: 1001,
  assignorId: "11",
  pesticideName: "Pesticide A",
  maxVolume: 50,
  minVolume: 10,
  processId: "Caring",
  cropId: "pomelo",
  growthStageId: "stage",
  isDelete: false,
  masterTypeId: "planting",
  farmId: "F-001",
  startTime: new Date("2023-01-01T08:00:00"),
  endTime: new Date("2023-01-01T17:00:00"),
  daysOfWeek: [1, 2, 3, 4, 5],
  daysOfMonth: [],
  customDates: [],
};

export const DEFAULT_FILTERS: FilterMasterTypeState = {
  createDateFrom: "",
  createDateTo: "",
  typeName: [] as string[],
};

export const DEFAULT_ROW = (): rowStateType => ({
  id: 0,
  length: 200,
  width: 50,
  plantsPerRow: 10,
  plantSpacing: 5,
  rowOrientation: "Horizontal",
  index: 0,
  position: { x: 0, y: 0 },
});
