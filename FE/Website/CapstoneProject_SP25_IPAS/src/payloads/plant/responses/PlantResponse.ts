import { Farm } from "@/types";

export interface GetPlant {
  plantId: number;
  plantCode: string;
  plantName: string; // ko bắt buộc
  plantIndex: number;
  healthStatus: string;
  createDate: Date;
  plantingDate: Date;
  description: string;
  masterTypeName: string;
  growthStageName: string;
  imageUrl: string;
  rowIndex: number;
  landPlotName: string;
}

export interface GetPlantSelect {
  plantId: string;
  plantCode: string;
}

export interface GetPlantOfRowSelect {
  id: number;
  code: string;
}
