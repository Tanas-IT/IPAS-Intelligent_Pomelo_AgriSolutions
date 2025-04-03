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

export interface productHarvestHistory {
  productHarvestHistoryId: number;
  masterTypeId: number;
  unit: string;
  sellPrice: number;
  quantityNeed: number;
  productName: string;
}
export interface UserWorkLog {
  userWorklogId: number;
  fullName: string;
  isReporter: boolean;
  avatarURL: string;
  userId: number;
  listResources: any[];
}

export interface WorkLog {
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
  workLogs: WorkLog[];
}

export interface GetHarvestDayDetail extends GetHarvestDay {
  productHarvestHistory: productHarvestHistory[];
  carePlanSchedules: CarePlanSchedulesDetail[];
}

export interface GetHarvestSelected {
  id: number;
  code: string;
  name: string;
}
