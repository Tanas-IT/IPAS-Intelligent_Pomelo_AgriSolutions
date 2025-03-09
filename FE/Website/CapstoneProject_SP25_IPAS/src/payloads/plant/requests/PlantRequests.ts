export interface PlantRequest {
  plantId: number;
  plantCode: string;
  healthStatus: string;
  plantReferenceId: number;
  description: string;
  masterTypeId: number;
  imageUrl: File | string | undefined;
  plantingDate: string;
  landPlotId?: number;
  landRowId?: number;
  plantIndex?: number;
}
