export interface GetPlant {
  plantId: number;
  plantCode: string;
  plantName: string; // ko bắt buộc
  plantIndex: number;
  healthStatus: string;
  createDate: Date;
  plantingDate: string;
  plantReferenceId: number;
  plantReferenceCode: string;
  description: string;
  masterTypeId: number;
  masterTypeName: string;
  growthStageName: string;
  imageUrl: string | File;
  landPlotId: number;
  landRowId: number;
  rowIndex: number;
  landPlotName: string;
  isDead: boolean;
  isPassed: boolean;
}

export interface GetPlantDetail extends GetPlant {
  characteristic: string;
}

export interface GetPlantSelect {
  id: string;
  code: string;
  name: string;
}

export interface plantSimulate {
  plantId: number;
  plantCode: string;
  plantIndex: number;
  healthStatus: string;
}

export interface GetPlantOfRowSelect {
  id: number;
  code: string;
}

export interface Plant {
  plantId: number;
  plantName: string;
}

export interface LandRow {
  landRowId: number;
  rowIndex: number;
  plants: Plant[];
}

export interface GetPlantTargetResponse {
  landPlotId: number;
  landPlotName: string;
  unit: string;
  rows: LandRow[];
  plants: Plant[];
  plantLots: any[];
  graftedPlants: any[];
}
