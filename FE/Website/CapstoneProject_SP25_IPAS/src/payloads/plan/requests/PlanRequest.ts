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
