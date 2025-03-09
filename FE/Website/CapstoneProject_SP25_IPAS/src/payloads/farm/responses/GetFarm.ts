interface Owner {
  email: string;
  fullName: string;
  phoneNumber: string;
}

interface Farm {
  farmCode: string;
  farmId: number;
  farmName: string;
  farmLogo?: File;
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
  length: string;
  width: string;
  soilType: string;
  status: "Active" | "Inactive";
  climateZone: string;
  createDate: Date;
  longitude: number;
  latitude: number;
}

export interface GetFarmInfo extends Farm {
  owner: Owner;
}

export interface GetFarmPicker {
  roleId: string;
  roleName: string;
  isActive: boolean;
  farm: Farm;
}
