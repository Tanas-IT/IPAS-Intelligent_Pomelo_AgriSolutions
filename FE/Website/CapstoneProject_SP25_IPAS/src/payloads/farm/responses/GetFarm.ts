export interface GetFarm {
  farmCode: string;
  farmId: number;
  farmName: string;
  logo?: File;
  logoUrl: string;
  address: string;
  provinceId?: string;
  province: string;
  districtId?: string;
  district: string;
  wardId?: string;
  ward: string;
  description: string;
  area: string;
  soilType: string;
  climateZone: string;
}
