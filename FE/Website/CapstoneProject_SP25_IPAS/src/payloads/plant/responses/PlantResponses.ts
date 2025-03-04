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
}

export interface GetPlantDetail extends GetPlant {
  characteristic: string;
}

export interface GetPlantSelect {
  id: string;
  code: string;
}

export interface plantSimulate {
  plantId: number;
  plantCode: string;
  plantIndex: number;
  healthStatus: string;
}
