interface landPlotCoordinations {
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
  area: string;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
  farmLongtitude: number;
  farmLatitude: number;
  landPlotCoordinations: landPlotCoordinations[];
}
