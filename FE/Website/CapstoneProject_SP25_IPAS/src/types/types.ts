import { GetLandPlot } from "@/payloads";
import { GetProp, UploadProps } from "antd";
import { ReactNode } from "react";

export interface ActionMenuItem {
  icon: React.ReactNode;
  label: string | React.ReactNode;
  onClick?: () => void;
  isCloseOnClick?: boolean;
}

export interface Farm {
  farmId: number;
  farmName: string;
  location: string;
}

export interface FileResource {
  resourceID: number;
  resourceCode: string;
  resourceType: string;
  resourceURL: string;
  fileFormat: string;
  createDate: string;
}

export interface LogoState {
  logo: File | null;
  logoUrl: string;
}

export interface AttachedImage {
  url: string;
  file: File;
}

export interface CoordsState {
  longitude: number;
  latitude: number;
}

export interface PolygonInit {
  id: string;
  coordinates: number[][][];
  landPlotId?: number;
}

export interface SelectOption {
  value: string | number;
  label: string | ReactNode;
}

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export type FilterConfigTypeState = {
  isActive: boolean | null;
};

export type FilterUserState = {
  createDateFrom: string;
  createDateTo: string;
  dobFrom: string;
  dobTo: string;
  roleIds: string[];
  genders: string;
  status: string;
};

export type FilterFarmState = {
  createDateFrom: string;
  createDateTo: string;
  status: string;
};

export type FilterPaymentHistoryState = {
  orderDateFrom: string;
  orderDateTo: string;
  enrolledDateFrom: string;
  enrolledDateTo: string;
  expiredDateFrom: string;
  expiredDateTo: string;
  totalPriceFrom: number | undefined;
  totalPriceTo: number | undefined;
  packageIds: string[];
  farmIds: string[];
  status: string;
};

export type FilterMasterTypeState = {
  createDateFrom: string;
  createDateTo: string;
  isActive: boolean | null;
};

export type FilterPlantLotState = {
  importedDateFrom: string;
  importedDateTo: string;
  partnerId: string[];
  status: string[];
  previousQuantityFrom: number | undefined;
  previousQuantityTo: number | undefined;
  isFromGrafted: boolean | null;
};

export type FilterCropState = {
  yearFrom: string;
  yearTo: string;
  harvestSeason: string[];
  actualYieldFrom: number | undefined;
  actualYieldTo: number | undefined;
  marketPriceFrom: number | undefined;
  marketPriceTo: number | undefined;
  LandPlotIds: string[];
  status: string[];
};

export type FilterHarvestDayState = {
  dateHarvestFrom: string;
  dateHarvestTo: string;
  totalPriceFrom: number | undefined;
  totalPriceTo: number | undefined;
  status: string[];
};

export type FilterCriteriaState = {
  createDateFrom: string;
  createDateTo: string;
  target: string[];
  isActive: boolean | null;
};

export type FilterPlantState = {
  plantingDateFrom: string;
  plantingDateTo: string;
  passedDateFrom: string;
  passedDateTo: string;
  landPlotIds: string[];
  landRowIds: string[];
  cultivarIds: string[];
  growthStageIds: string[];
  healthStatus: string[];
  isLocated: boolean | null;
  isDead: boolean | null;
  isPassed: boolean | null;
};

export type FilterGraftedPlantState = {
  plantIds: string[];
  plantLotIds: string[];
  separatedDateFrom: string;
  separatedDateTo: string;
  status: string[];
  cultivarIds: string[];
  graftedDateFrom: string;
  graftedDateTo: string;
  isCompleted: boolean | null;
};

export type FilterLandRowState = {
  rowIndexFrom: number | undefined;
  rowIndexTo: number | undefined;
  treeAmountFrom: number | undefined;
  treeAmountTo: number | undefined;
};

export type FilterEmployeeState = {
  roleName: string[];
};

export type FilterPartnerState = {
  major: string[];
};

export interface LandPlotsStateType {
  longitude: number;
  latitude: number;
  landPlots: GetLandPlot[];
}

export interface plotOfCrop {
  landPlotID: number;
  landPlotName: string;
}

// export interface rowStateType {
//   id: number;
//   length: number;
//   width: number;
//   plantsPerRow: number;
//   plantSpacing: number;
//   index: number;
// }

export interface AnswerData {
  title: string;
  summary: string;
  details: string;
  note: string;
  confidence: string;
}

export type CriteriaExportType = "PlantID" | "PlantLotID" | "GraftedPlantID";
