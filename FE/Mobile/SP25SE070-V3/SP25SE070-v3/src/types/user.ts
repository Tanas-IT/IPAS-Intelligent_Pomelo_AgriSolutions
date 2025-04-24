export interface GetUser2 {
  userId: number;
  userCode: string;
  email: string;
  fullName: string;
  gender: "Male" | "Female";
  dob: string;
  phoneNumber: string;
  createDate: string;
  status: string;
  roleName: string;
  avatarURL: string;
}

export interface GetUser {
  userId: number;
  fullName: string;
  avatarURL: string;
}

export interface GetUserInFarm {
  userId: number;
  fullName: string;
  user: GetUser;
}

export interface GetUserRoleEmployee {
  userId: number;
  userCode: string;
  email: string;
  fullName: string;
  avatarURL: string;
}

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

export interface MediaFile {
  id?: number;
  uri: string;
  type: string;
  name: string;
}