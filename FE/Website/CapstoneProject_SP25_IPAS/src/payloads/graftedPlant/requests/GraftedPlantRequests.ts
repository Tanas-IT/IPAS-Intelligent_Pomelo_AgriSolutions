import { FileResource } from "@/types";

export interface GraftedPlantRequest {
  graftedPlantId: number;
  graftedPlantName: string;
  separatedDate: string;
  graftedDate: string;
  status: string;
  note: string;
  plantLotId: number;
}

export interface CreateGraftedPlantsRequest {
  plantId: number;
  totalNumber: number;
  graftedDate: string;
  note: string;
}

export interface GraftedGrowthHistoryRequest {
  graftedPlantId: number;
  issueName: string;
  content: string;
  resources: File[] | FileResource[];
}
