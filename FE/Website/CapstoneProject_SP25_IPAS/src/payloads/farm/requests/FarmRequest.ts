export interface FarmRequest {
  farmCode: string;
  farmId: number;
  farmName: string;
  farmLogo: File;
  description: string;
  address: string;
  district: string;
  ward: string;
  province: string;
  longitude: number;
  latitude: number;
  area: string;
  length: string;
  width: string;
  soilType: string;
  climateZone: string;
}

interface DocumentResource {
  resourceID: string;
  file: File;
}

export interface FarmDocumentRequest {
  LegalDocumentId: string;
  legalDocumentType: string;
  legalDocumentName: string;
  resources: DocumentResource[];
}
