interface landPlotCoordinations {
  longitude: number;
  latitude: number;
}
interface landRows {
  rowIndex: number;
  treeAmount: number; // cần có
  distance: number; // cần có
  length: number;
  width: number;
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
  landPlotCoordinations: landPlotCoordinations[];
  landRows: landRows[];
}
