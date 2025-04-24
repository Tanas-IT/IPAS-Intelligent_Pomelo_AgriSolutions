import { landRowSimulate } from "@/payloads/landRow";

interface landPlotCoordinations {
  longitude: number;
  latitude: number;
}
interface landRows {
  landRowId?: number;
  rowIndex: number;
  treeAmount: number; // cần có
  distance: number; // cần có
  length: number;
  width: number;
  direction: string;
  description: string;
}

export interface LandPlotRequest {
  landPlotId: string;
  landPlotCode: string;
  landPlotName: string;
  area: number;
  plotLength: number;
  plotWidth: number;
  soilType: string;
  description: string;
  targetMarket: string;
  isRowHorizontal: boolean; // cần có
  lineSpacing: number; // cần có
  rowPerLine: number; // cần có
  rowSpacing: number; // cần có
  numberOfRows: number; // cần có
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  landPlotCoordinations: landPlotCoordinations[];
  landRows: landRows[];
}

export interface LandPlotUpdateRequest {
  landPlotId: string;
  landPlotName: string;
  area: number;
  length: number;
  width: number;
  soilType: string;
  description: string;
  targetMarket: string;
  status?: string;
}

export interface LandPlotUpdateCoordinationRequest {
  landPlotId: string;
  coordinationsUpdateModel: landPlotCoordinations[];
}

export interface LandPlotSimulateRequest {
  landPlotId: number;
  numberOfRows: number; // cần có
  landRows: landRowSimulate[];
}
