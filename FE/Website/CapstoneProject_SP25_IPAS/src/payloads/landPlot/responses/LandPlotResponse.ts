interface landPlotCoordinations {
  landPlotCoordinationId: string;
  landPlotCoordinationCode: string;
  longitude: number;
  latitude: number;
}

export interface GetLandPlot {
  landPlotId: number;
  landPlotCode: string;
  landPlotName: string;
  area: string;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
  landPlotCoordinations: landPlotCoordinations[];
}
