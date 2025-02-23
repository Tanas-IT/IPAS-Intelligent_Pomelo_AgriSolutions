export interface GetProcessList {
    processId: number;
    processCode: string;
    processName: string;
    isActive: boolean;
    createDate: Date;
    updateDate: Date;
    isDeleted: boolean;
    farmName: string;
    masterTypeName: string;
    growthStageName: string;
  }