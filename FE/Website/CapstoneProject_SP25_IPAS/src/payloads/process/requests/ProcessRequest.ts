export interface ListPlan {
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
