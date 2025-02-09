export interface FarmRequest {
  farmCode: string;
  farmId: number;
  farmName: string;
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

export interface FarmDocumentRequest {
  landOwnershipCertificate: File;
  operatingLicense: File;
  landLeaseAgreement: File;
  pesticideUseLicense: File;
}
