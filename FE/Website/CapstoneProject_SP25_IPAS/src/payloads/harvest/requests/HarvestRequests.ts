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

export interface productHarvestHistoryReq {
  masterTypeId: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  quantityNeed: number;
}

export interface AssignEmployee {
  userId: number;
  isReporter: boolean;
}

export interface addNewTask {
  taskName?: string;
  assignorId?: number;
  startTime?: string;
  endTime?: string;
  listEmployee?: AssignEmployee[];
}

export interface HarvestRequest {
  harvestHistoryId?: number;
  cropId?: number;
  dateHarvest?: string;
  harvestHistoryNote: string;
  startTime?: string;
  endTime?: string;
  productHarvestHistory?: productHarvestHistoryReq[];
  addNewTask?: addNewTask;
}

export interface plantHarvestRecords {
  plantId: number;
  quantity: number;
}

export interface RecordHarvestRequest {
  masterTypeId: number;
  harvestHistoryId: number;
  userId: number;
  plantHarvestRecords: plantHarvestRecords[];
}

export interface UpdateProductHarvestRequest {
  productHarvestHistoryId: number;
  unit?: string;
  sellPrice?: number;
  costPrice?: number;
  quantity: number;
  userId: number;
}
