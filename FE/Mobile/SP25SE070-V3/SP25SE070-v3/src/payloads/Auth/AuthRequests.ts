export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  gender: "Male" | "Female";
  phone: string;
  dob: string;
}
