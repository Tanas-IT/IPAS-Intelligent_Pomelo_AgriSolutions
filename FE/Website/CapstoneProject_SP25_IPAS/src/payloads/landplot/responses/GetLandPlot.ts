import { landRowSimulate } from "@/payloads/landRow";

export interface GetLandPlotSelected {
  id: number;
  code: string;
  name: string;
}

export interface landPlotCoordinations {
  landPlotCoordinationId: string;
  landPlotCoordinationCode: string;
  longitude: number;
  latitude: number;
}

export interface GetLandPlot {
  landPlotId: string;
  landPlotCode: string;
  landPlotName: string;
  description: string;
  area: number;
  length: number;
  width: number;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
  farmLongtitude: number;
  farmLatitude: number;
  landPlotCoordinations: landPlotCoordinations[];
}

export interface GetLandPlotOfFarm {
  longitude: number;
  latitude: number;
  landPlots: GetLandPlot[];
}

export interface GetLandPlotHaveEmptyPlant extends GetLandPlot {
  emptySlot: number;
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
