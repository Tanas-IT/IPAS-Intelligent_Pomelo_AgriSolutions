export interface LandPlotRequest {
  landPlotId: string;
  landPlotCode: string;
  landPlotName: string;
  description: string;
  area: string;
  length: number;
  width: number;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
  farmLongtitude: number;
  farmLatitude: number;
}
