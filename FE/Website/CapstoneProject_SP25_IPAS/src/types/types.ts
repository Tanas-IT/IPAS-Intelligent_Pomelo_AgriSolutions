import { GetLandPlot } from "@/payloads";
import { GetProp, UploadProps } from "antd";

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

export interface LogoState {
  logo: File | null;
  logoUrl: string;
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
  label: string;
}

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export type FilterMasterTypeState = {
  createDateFrom: string;
  createDateTo: string;
  typeName: string[];
};

export type FilterPlantState = {
  plantingDateFrom: string;
  plantingDateTo: string;
  landPlotIds: string[];
  landRowIds: string[];
  cultivarIds: string[];
  growthStageIds: string[];
  healthStatus: string[];
  isLocated: boolean | null;
  isDead: boolean | null;
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

// export interface rowStateType {
//   id: number;
//   length: number;
//   width: number;
//   plantsPerRow: number;
//   plantSpacing: number;
//   index: number;
// }
