import { Farm } from "@/types";

export interface GetPlant {
  plantId: number;
  plantCode: string;
  plantName: string;
  plantIndex: number;
  healthStatus: string;
  createDate: Date;
  plantingDate: Date;
  description: string;
  imageUrl: string;
}

export interface GetPlantSelect {
  plantId: string;
  plantCode: string;
}
