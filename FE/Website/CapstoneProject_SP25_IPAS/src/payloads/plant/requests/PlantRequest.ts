export interface PlantRequest {
  plantId: number;
  plantCode: string;
  healthStatus: string;
  description: string;
  masterTypeId: number;
  imageUrl: File | string | undefined;
  plantingDate: string;
  landPlotId: number;
  landRowId: number;
  plantIndex: number;
}
