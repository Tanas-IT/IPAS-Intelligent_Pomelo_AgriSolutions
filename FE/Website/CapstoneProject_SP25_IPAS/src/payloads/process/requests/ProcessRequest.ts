export interface ListPlan {
    PlanId?: number;
    PlanName: string;
    PlanDetail: string;
    PlanNote: string;
    GrowthStageId: number;
    MasterTypeId: number;

}


export interface ProcessRequest {
    FarmId: number;
    ProcessName: string;
    MasterTypeId: number;
    GrowthStageId: number;
    IsActive: boolean;
    ListPlan: ListPlan[]
}

export interface SubProcess {
    SubProcessId: number;
    SubProcessName: string;
    ParentSubProcessId: number;
    IsDefault: boolean;
    IsActive: boolean;
    MasterTypeId: number;
    GrowthStageId: number;
    Status: string;
    Order: number;
    ListPlan: ListPlan[];
}

export interface UpdateProcessRequest {
    ProcessId: number;
    ProcessName: string;
    IsActive: boolean;
    IsDefault: boolean;
    IsDeleted: boolean;
    MasterTypeId: number;
    GrowthStageID: number;
    ListUpdateSubProcess: SubProcess[];
    ListPlan: ListPlan[];
}
