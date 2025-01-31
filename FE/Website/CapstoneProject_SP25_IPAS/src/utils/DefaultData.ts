import { UserForm } from "@/models/UserForm.model";

export const getInitialUserForm = (): UserForm => ({
  fullName: {
    value: "",
    errorMessage: "",
  },
  userName: {
    value: "",
    errorMessage: "",
  },
  phoneNumber: {
    value: "",
    errorMessage: "",
  },
  DOB: {
    value: null,
    errorMessage: "",
  },
  gender: {
    value: "Nam",
    errorMessage: "",
  },
  isActive: {
    value: 0,
    errorMessage: "",
  },
});
