export interface GetProcessList {
    processId: number;
    processCode: string;
    processName: string;
    isActive: boolean;
    createDate: Date;
    updateDate: Date;
    isDeleted: boolean;
    farmName: string;
    processMasterTypeModel: {
      masterTypeId: number;
      masterTypeName: string;
    },
    processGrowthStageModel: {
      growthStageId: number;
      growthStageName: string;
    },
  }