export interface CreateWorklogRequest {
    worklogName: string;
    status: "pending";
    cropId?: string;
    plantPlotId: string;
    processId: string;
    notes?: string;
    date: Date;
    startTime: string;
    endTime: string;
    responsibleBy: string[];
    assignorId: string;
  }
  