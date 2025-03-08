export interface GetUser {
  userId: number;
  fullName: string;
  avatarURL: string;
}

export interface GetUserRoleEmployee {
  userId: number;
  userCode: string;
  email: string;
  fullName: string;
  avatarURL: string;
}
