import { Dayjs } from "dayjs";

export interface PlanRequest {
  planName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  planDetail: string;
  notes?: string;
  responsibleBy?: string;
  frequency: string;
  assignorId: number;
  pesticideName?: string;
  maxVolume?: number;
  minVolume?: number;
  processId: number;
  cropId?: number;
  growthStageId: number[];
  isDelete?: boolean;
  masterTypeId: number;
  dayOfWeek: number[];
  dayOfMonth: number[];
  customDates?: string[];
  listEmployee: {
    userId: number;
    isReporter: boolean;
  }[];
  planTargetModel?: {
    landRowID: number[];
    landPlotID?: number;
    graftedPlantID: number[];
    plantLotID: number[];
    plantID: number[];
    unit: string;
  }[];
  listLandPlotOfCrop: number[];
}

export interface UpdatePlanRequest {
  planId: number;
  status: string;
  planName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  planDetail?: string;
  notes?: string;
  responsibleBy?: string;
  frequency: string;
  assignorId?: number;
  pesticideName?: string;
  maxVolume?: number;
  minVolume?: number;
  processId: number;
  cropId: number;
  growthStageId: number;
  isDelete?: boolean;
  masterTypeId: number;
  dayOfWeek: number[];
  dayOfMonth: number[];
  customDates?: string[];
  listEmployee: {
    userId: number;
    isReporter: boolean;
  }[];
  planTargetModel?: {
    landRowID: number;
    landPlotID: number;
    graftedPlantID: number;
    plantLotID: number;
    plantID: number;
  }[];
  listLandPlotOfCrop: number[];
}

// export interface PlanTarget {
//     landRowID: number;
//     landPlotID: number;
//     graftedPlantID: number;
//     plantLotID: number;
//     plantID: number;
// }

interface PlantOption {
  plantId: number;
  plantName: string;
}

interface PlantLotOption {
  plantLotId: number;
  plantLotName: string;
}

interface GraftedPlantOption {
  graftedPlantId: number;
  graftedPlantName: string;
}

interface RowOption {
  landRowId: number;
  rowIndex: number;
  plants: PlantOption[];
}

export interface SelectedTarget {
  unit: string;
  landPlotId: number | undefined;
  landPlotName: string;
  rows: RowOption[];
  plants: PlantOption[];
  plantLots: PlantLotOption[];
  graftedPlants: GraftedPlantOption[];
}
