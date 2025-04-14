export interface FileResource {
  resourceID: number;
  resourceCode: string;
  resourceType: string;
  resourceURL: string;
  fileFormat: string;
  createDate: string;
}

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

// export interface PlantGrowthHistoryRequest {
//   plantId: number;
//   issueName: string;
//   content: string;
//   resources: File[] | FileResource[];
//   userId: number;
// }

export interface PlantGrowthHistoryRequest {
  plantId: number;
  userId: string | null;
  issueName?: string;
  content: string;
  images?: { uri: string; type: string; name: string }[];
}