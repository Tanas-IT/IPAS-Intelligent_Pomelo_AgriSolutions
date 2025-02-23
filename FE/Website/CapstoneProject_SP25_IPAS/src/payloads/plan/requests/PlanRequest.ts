import { Dayjs } from "dayjs";

export interface PlanRequest {
    planName: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    planDetail: string;
    responsibleBy?: string[];
    frequency: string;
    landPlotId: number;
    assignorId: number;
    processId: number;
    cropId: number;
    growthStageId: number;
    masterTypeId: number;
    dayOfWeek: number[];
    dayOfMonth: number[];
    customDates? : Dayjs[];
    listEmployee: {
        userId: number;
        isReporter: boolean;
    }[];
}