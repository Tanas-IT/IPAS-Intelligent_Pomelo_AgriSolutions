interface user {
  userId: number;
  userCode: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: "Male | Female";
  dob: Date;
  createDate: Date;
  status: string;
}
export interface GetEmployee {
  roleId: number;
  roleName: string;
  user: user
}


