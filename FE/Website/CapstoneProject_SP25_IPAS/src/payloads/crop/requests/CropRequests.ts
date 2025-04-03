export interface CropRequest {
  cropId: number;
  cropName: string;
  startDate: string;
  endDate: string;
  cropExpectedTime: string;
  cropActualTime: string;
  harvestSeason: string;
  estimateYield: number;
  actualYield: number;
  notes: string;
  marketPrice: number;
  status: string;
  landPlotCrops: number[];
}
