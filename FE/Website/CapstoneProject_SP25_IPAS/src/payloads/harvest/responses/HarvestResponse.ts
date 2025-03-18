import { GetPlant } from "@/payloads/plant";

export interface MonthlyData {
  month: number;
  year: number;
  totalQuantity: number;
}

export interface GetHarvestStatisticOfPlant {
  totalYearlyQuantity: number;
  numberHarvest: number;
  masterTypeId: number;
  masterTypeName: number;
  monthlyData: MonthlyData[];
}

export interface GetHarvestStatisticPlants {
  plant: GetPlant
  totalQuantity: number;
}
