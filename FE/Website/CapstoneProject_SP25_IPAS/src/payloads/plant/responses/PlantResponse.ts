export interface GetPlant {
  plantId: number;
  plantCode: string;
  plantName: string; // ko bắt buộc
  plantIndex: number;
  healthStatus: string;
  createDate: Date;
  plantingDate: string;
  description: string;
  masterTypeId: number;
  masterTypeName: string;
  growthStageName: string;
  imageUrl: string | File;
  landPlotId: number;
  landRowId: number;
  rowIndex: number;
  landPlotName: string;
}

export interface GetPlantDetail extends GetPlant {
  characteristic: string;
}

export interface GetPlantSelect {
  plantId: string;
  plantCode: string;
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
