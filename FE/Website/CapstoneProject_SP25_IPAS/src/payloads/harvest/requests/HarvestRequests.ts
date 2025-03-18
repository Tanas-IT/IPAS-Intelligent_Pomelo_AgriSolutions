export interface HarvestStatisticOfPlantRequest {
  plantId: number;
  yearFrom: number;
  yearTo: number;
  productId: number;
}

export interface HarvestStatisticInYearRequest {
  topN: number;
  yearFrom: number;
  yearTo: number;
  productId: number;
}
