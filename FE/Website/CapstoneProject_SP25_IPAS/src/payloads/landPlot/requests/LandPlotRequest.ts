interface landPlotCoordinations {
  longitude: number;
  latitude: number;
}
interface landRows {
  rowIndex: number;
  // treeAmount: number;
  plantsPerRow: number;  // cần có 
  plantSpacing: number; // cần có 
  length: number;
  width: number;
}

export interface LandPlotRequest {
  // landPlotId: string;
  // landPlotCode: string;
  landPlotName: string;
  area: number;
  plotLength: number;
  plotWidth: number;
  soilType: string;
  description: string;
  targetMarket: string;
  landPlotCoordinations: landPlotCoordinations[];
  isHorizontal: boolean;  // cần có 
  lineSpacing: number; // cần có 
  rowPerLine: number; // cần có 
  rowSpacing: number; // cần có 
  numberOfRows: number; // cần có 
  landRows: landRows[];
}
