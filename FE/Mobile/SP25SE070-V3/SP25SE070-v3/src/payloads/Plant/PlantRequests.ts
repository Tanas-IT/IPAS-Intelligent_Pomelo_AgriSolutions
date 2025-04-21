import { MediaFile } from "@/types";

export interface PlantRequest {
  plantId: number;
  healthStatus: string;
}

export interface PlantGrowthHistoryRequest {
  plantGrowthHistoryId: number;
  plantId: number;
  userId: string;
  issueName: string;
  content: string;
  images?: MediaFile[];
  videos?: MediaFile[];
}
