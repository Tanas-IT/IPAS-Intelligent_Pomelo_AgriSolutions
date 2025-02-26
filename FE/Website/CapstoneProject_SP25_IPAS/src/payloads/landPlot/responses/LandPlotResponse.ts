interface landPlotCoordinations {
  landPlotCoordinationId: string;
  landPlotCoordinationCode: string;
  longitude: number;
  latitude: number;
}

export interface GetLandPlot {
  landPlotId: number;
  landPlotCode: string;
  name: string;
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
