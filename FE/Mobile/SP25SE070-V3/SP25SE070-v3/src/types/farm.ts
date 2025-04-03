import { ApiResponse } from "./apiBase/responses/ApiResponse";

export interface Farm {
  id: string;
  name: string;
  logo: string;

}

export interface Owner {
  email: string;
  fullName: string;
  phoneNumber: string;
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

export type GetFarmInfoApiResponse = ApiResponse<GetFarmInfo>;
export type GetFarmPickerApiResponse = ApiResponse<GetFarmPicker>;