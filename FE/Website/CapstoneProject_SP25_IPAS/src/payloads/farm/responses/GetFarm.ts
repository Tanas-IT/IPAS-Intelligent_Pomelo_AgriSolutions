interface GetFarmCoordination {
  farmCoordinationId: string;
  longitude: number;
  lagtitude: number;
}

interface Owner {
  email: string;
  fullName: string;
  phoneNumber: string;
}

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
  createDate: Date;
  owner: Owner;
  farmCoordinations: GetFarmCoordination[];
}

export interface GetFarmPicker {
  roleId: string;
  roleName: string;
  farmCode: string;
  farmId: number;
  farmName: string;
  // address: string;
  // province: string;
  // district: string;
  // ward: string;
  // createdAt: Date;
  // status: "Active" | "Inactive";
  // logoUrl: string;
}
