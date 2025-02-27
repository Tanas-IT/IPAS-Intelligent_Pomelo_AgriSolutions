import { GetLandPlot } from "@/payloads";
import { GetProp, UploadProps } from "antd";

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

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export type FilterMasterTypeState = {
  createDateFrom: string;
  createDateTo: string;
  typeName: string[];
};

export type FilterPlantState = {
  createDateFrom: string;
  createDateTo: string;
};

export interface LandPlotsStateType {
  longitude: number;
  latitude: number;
  landPlots: GetLandPlot[];
}

export interface rowStateType {
  id: number;
  length: number;
  width: number;
  plantsPerRow: number;
  plantSpacing: number;
  // rowOrientation: "Horizontal" | "Vertical";
  index: number;
}
