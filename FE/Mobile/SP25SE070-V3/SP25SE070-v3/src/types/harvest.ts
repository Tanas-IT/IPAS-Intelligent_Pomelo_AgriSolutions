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

  export interface PlantHarvestRecord {
    plantId: number;
    quantity: number;
  }
  
  export interface CreateHarvestRecordRequest {
    masterTypeId: number;
    harvestHistoryId: number;
    userId: number;
    plantHarvestRecords: PlantHarvestRecord[];
  }
  
  export interface MasterTypeOption {
    id: number;
    name: string;
  }
  
  export interface HarvestHistoryOption {
    id: number;
    code: string;
  }

  export interface ProductHarvest {
    productHarvestHistoryId: number;
    masterTypeId: number;
    unit: string;
    sellPrice: number;
    costPrice: number;
    quantityNeed?: number;
    actualQuantity?: number;
    recordDate?: string;
    harvestHistoryId: number;
    productName: string;
    harvestHistoryCode: string;
    plantLogHarvest: any[];
  }
  
  export interface AvailableHarvest {
    harvestHistoryId: number;
    harvestHistoryCode: string;
    dateHarvest: string;
    harvestHistoryNote?: string;
    totalPrice?: number;
    cropId: number;
    cropName: string;
    yieldHasRecord: number;
    productHarvestHistory: ProductHarvest[];
  }