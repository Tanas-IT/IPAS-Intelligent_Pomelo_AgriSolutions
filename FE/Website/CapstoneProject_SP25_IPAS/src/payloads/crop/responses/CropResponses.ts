import { plotOfCrop } from "@/types";

export interface CropResponse {
  cropId: number;
  cropCode: string;
  cropName: string;
  startDate: string;
  endDate: string;
  createDate: string;
  updateDate: string;
  cropExpectedTime: string;
  cropActualTime: string;
  harvestSeason: string;
  estimateYield: number;
  actualYield: number;
  status: string;
  notes: string;
  isDeleted: false;
  marketPrice: number;
  farmId: number;
  harvestHistories: any[];
  landPlotCrops: any[];
  plans: any[];
}

export interface GetCrop2 extends CropResponse {
  numberHarvest: number;
  numberPlot: number;
  yieldHasRecord: number;
}

export interface GetCropDetail extends GetCrop2 {
  landPlotCrops: plotOfCrop[];
}

export interface GetLandPlotOfCrop {
  landPlotId: number;
  landPlotCode: string;
  landPlotName: string;
  area: number;
  length: number;
  width: number;
  soilType: string;
  createDate: string;
  updateDate: string;
  status: string;
  description: string;
  farmId: number;
  isDeleted: boolean;
  isRowHorizontal: boolean;
  targetMarket: string;
  rowPerLine: number;
  rowSpacing: number;
  lineSpacing: number;
  numberOfRows: number;
  landPlotCoordinations: any[];
  landRows: any[];
  landPlotCrops: any[];
  planTargets: any[];
}

export interface GetCropSelect {
  id: string;
  code: string;
  name: string;
}
