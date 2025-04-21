import { FileResource } from "@/types";

export interface PlantRequest {
  plantId?: number;
  plantCode?: string;
  healthStatus?: string;
  plantReferenceId?: number;
  description?: string;
  masterTypeId?: number;
  imageUrl?: File | string | undefined;
  plantingDate?: string;
  landPlotId?: number;
  landRowId?: number;
  plantIndex?: number;
}

export interface PlantGrowthHistoryRequest {
  plantGrowthHistoryId: number;
  plantId: number;
  issueName: string;
  content: string;
  resources: File[] | FileResource[];
}
