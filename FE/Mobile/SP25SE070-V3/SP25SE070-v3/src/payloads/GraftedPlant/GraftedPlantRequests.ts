import { FileResource, MediaFile } from "@/types";

export interface GraftedPlantRequest {
  graftedPlantId: number;
  status: string;
}

export interface CreateGraftedPlantsRequest {
  plantId: number;
  totalNumber: number;
  graftedDate: string;
  note: string;
}

export interface GraftedGrowthHistoryRequest {
  graftedPlantNoteId: number;
  userId: string;
  graftedPlantId: number;
  issueName: string;
  content: string;
  images?: MediaFile[];
  videos?: MediaFile[];
}
