export interface PlanRequest {
    planName: string;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    planDetail: string;
    responsibleBy: string[];
    frequency: string;
    landPlot: number;
    assignorId: number;
    processId: string;
    cropId: string;
    growthStageId: string;
    masterTypeId: number;
    daysOfWeek: number[];
    daysOfMonth: number[];
    customDates : Date[];
}