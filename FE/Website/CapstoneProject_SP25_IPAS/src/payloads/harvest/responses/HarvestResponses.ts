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
  plant: GetPlant;
  totalQuantity: number;
}

export interface carePlanSchedules {
  customDates?: string;
  startTime: string;
  endTime: string;
}

export interface GetHarvestDay {
  harvestHistoryId: number;
  harvestHistoryCode: string;
  dateHarvest: string;
  harvestHistoryNote: string;
  totalPrice: number;
  harvestStatus: string;
  yieldHasRecord: number;
  carePlanSchedules: carePlanSchedules[];
}

export interface productHarvestHistoryRes {
  productHarvestHistoryId: number;
  masterTypeId: number;
  unit: string;
  costPrice?: number;
  sellPrice?: number;
  quantityNeed: number;
  productName?: string;
  yieldHasRecord: number;
}
export interface UserWorkLog {
  userWorklogId: number;
  fullName: string;
  isReporter: boolean;
  avatarURL: string;
  userId: number;
  listResources: any[];
}

export interface WorkLogHarvest {
  workLogId: number;
  workLogCode: string;
  status: string;
  workLogName: string;
  date: string;
  actualStartTime: string;
  actualEndTime: string;
  isConfirm: boolean;
  scheduleId: number;
  userWorkLogs: UserWorkLog[];
}

export interface CarePlanSchedulesDetail {
  scheduleId: number;
  status: string;
  customDates: string;
  startTime: string;
  endTime: string;
  farmID: number;
  harvestHistoryID: number;
  workLogs: WorkLogHarvest[];
}

export interface GetHarvestDayDetail extends GetHarvestDay {
  productHarvestHistory: productHarvestHistoryRes[];
  carePlanSchedules: CarePlanSchedulesDetail[];
}

export interface GetPlantHasHarvest {
  productHarvestHistoryId: number;
  masterTypeId: number;
  plantId: number;
  unit: string;
  actualQuantity: number;
  recordDate: string;
  recordBy: string;
  avartarRecord: string;
  harvestHistoryId: number;
  productName: string;
  harvestHistoryCode: string;
  plantName: string;
  plantIndex: number;
  landRowIndex: number;
  lantPlotName: string;
}

export interface GetHarvestSelected {
  id: number;
  code: string;
  name: string;
}
