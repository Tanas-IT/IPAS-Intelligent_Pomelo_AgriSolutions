interface landPlotCoordinations {
  landPlotCoordinationId: string;
  landPlotCoordinationCode: string;
  longitude: number;
  
}

export interface GetLandPlot {
  landPlotId: string;
  landPlotCode: string;
  LandPlotName: string;
  area: string;
  soilType: string;
  createDate: Date;
  status: string;
  targetMarket: string;
}
