export interface UserRequest {
  userId?: number;
  email?: string;
  password?: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  roleName: string;
}

export interface Skill {
  skillID: number;
  scoreOfSkill: number;
}

export interface AddUserFarmRequest {
  farmId: number;
  userId: number;
  roleName: string;
  isActive: boolean;
  skills: Skill[];
}
