import { Farm } from "@/types";

export interface GetPlant {
  userCode: string;
  userId: number;
  fullname: string;
  userName: string;
  phone: string;
  roleId: number;
  isActive: boolean;
  status: number;
  farms?: Farm[];
}

export interface GetPlantSelect {
  plantId: string;
  plantCode: string;
}
