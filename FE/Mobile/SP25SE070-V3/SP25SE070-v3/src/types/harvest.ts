export interface HarvestRecord {
    productHarvestHistoryId: number;
    plantId: number;
    plantName: string;
    unit: string;
    actualQuantity: number;
    harvestHistoryId: number;
    harvestHistoryCode: string;
    harvestDate: string;
    masterTypeId: number;
    productName: string;
    cropName: string;
    recordDate: string;
    recordBy?: string;
  }
  
  export interface HarvestResponse {
    data: HarvestRecord[];
    totalPage: number;
    totalRecord: number;
  }
  
  export interface CreateHarvestRecordRequest {
    masterTypeId: number;
    plantId: number;
    quantity: number;
    harvestHistoryId: number;
  }
  
  export interface MasterTypeOption {
    id: number;
    name: string;
  }
  
  export interface HarvestHistoryOption {
    id: number;
    code: string;
  }