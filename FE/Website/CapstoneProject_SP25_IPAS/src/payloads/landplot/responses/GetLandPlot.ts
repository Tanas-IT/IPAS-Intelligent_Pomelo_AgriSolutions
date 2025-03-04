import { landRowSimulate } from "@/payloads/landRow";

export interface landPlotCoordinations {
  landPlotCoordinationId: string;
  landPlotCoordinationCode: string;
  longitude: number;
  latitude: number;
}

export interface GetLandPlotSelected {
  id: number;
  code: string;
  name: string;
}

export interface GetLandPlot {
  landPlotId: string;
  landPlotCode: string;
  landPlotName: string;
  description: string;
  area: string;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
  farmLongtitude: number;
  farmLatitude: number;
  landPlotCoordinations: landPlotCoordinations[];
}

export interface GetLandPlotSimulate {
  landPlotId: number;
  landPlotCode: string;
  landPlotName: string;
  rowPerLine: number;
  rowSpacing: number;
  isRowHorizontal: boolean;
  lineSpacing: number;
  numberOfRows: number;
  landRows: landRowSimulate[];
}
