import { Dayjs } from "dayjs";

export interface PlanRequest {
    planName: string;
    startDate: string; // ISO format
    endDate: string;   // ISO format
    startTime: string;
    endTime: string;
    isActive: boolean;
    planDetail: string;
    notes?: string; // Thêm theo Swagger
    responsibleBy?: string; // Đổi từ string[] -> string
    frequency: string;
    assignorId: number;
    pesticideName?: string; // Thêm theo Swagger
    maxVolume?: number;
    minVolume?: number;
    processId: number;
    cropId: number;
    growthStageId: number;
    isDelete?: boolean; // Thêm theo Swagger
    masterTypeId: number;
    dayOfWeek: number[];
    dayOfMonth: number[];
    customDates?: string[]; // Chuyển từ Dayjs[] -> string[]
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
}
