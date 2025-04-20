export interface UserRequest {
  userId?: number;
  email?: string;
  password?: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: "Male" | "Female";
  roleName: string;
}
