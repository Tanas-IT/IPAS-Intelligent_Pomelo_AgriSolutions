export interface GetWorklog {
    worklogId: string;
    date: Date;
    name: string;
    status: number;
    startTime: string;
    endTime: string;
    isConfirm: boolean;
    notes?: string;
    userId: string[];
    typeId: string;
    backgroundColor: string;
    textColor: string;
  }
  