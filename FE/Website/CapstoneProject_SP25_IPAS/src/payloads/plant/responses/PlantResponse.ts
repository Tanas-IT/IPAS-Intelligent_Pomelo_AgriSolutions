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
