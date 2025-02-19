export interface SubProcess {
    subProcessId: number;
    subProcessCode: string;
    subProcessName: string;
    parentSubProcessId?: number;
    isDefault: boolean;
    isActive: boolean;
    createDate: string;
    updateDate: string;
    isDeleted: boolean;
    processId: number;
    listSubProcessData: SubProcess[];
  }
  
  export interface GetProcessDetail {
    processId: number;
    processCode: string;
    processName: string;
    isDefault: boolean;
    isActive: boolean;
    createDate: string;
    updateDate: string;
    isDeleted: boolean;
    farmName: string;
    masterTypeName: string;
    growthStageName: string;
    subProcesses: SubProcess[];
    listProcessData: any[];
  }
  