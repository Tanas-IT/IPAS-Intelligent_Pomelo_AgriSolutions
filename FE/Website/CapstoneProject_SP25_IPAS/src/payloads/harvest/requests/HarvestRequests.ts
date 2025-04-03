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

export interface productHarvestHistory {
  masterTypeId: number;
  unit: string;
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
  totalPrice: number;
  startTime?: string;
  endTime?: string;
  productHarvestHistory?: productHarvestHistory[];
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
