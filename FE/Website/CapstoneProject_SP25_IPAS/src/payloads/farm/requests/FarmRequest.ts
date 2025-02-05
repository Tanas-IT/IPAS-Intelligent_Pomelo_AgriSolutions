export interface FarmRequest {
  farmCode: string;
  farmId: number;
  farmName: string;
  logo: File;
  address: string;
  district: string;
  ward: string;
  province: string;
  description: string;
  area: string;
  soilType: string;
  climateZone: string;
}

export interface FarmDocumentRequest {
  landOwnershipCertificate: File;
  operatingLicense: File;
  landLeaseAgreement: File;
  pesticideUseLicense: File;
}
