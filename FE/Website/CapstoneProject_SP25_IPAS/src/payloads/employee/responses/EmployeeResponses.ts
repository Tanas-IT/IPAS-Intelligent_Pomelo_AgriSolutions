interface user {
  userId: number;
  userCode: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: "Male | Female";
  dob: Date;
  avatarURL: string;
  createDate: Date;
  status: string;
  
}
export interface GetEmployee {
  userId: number;
  roleId: number;
  roleName: string;
  user: user;
  isActive: boolean;
  skills: {
    skillID: number;
    scoreOfSkill: number;
  }[];
}
