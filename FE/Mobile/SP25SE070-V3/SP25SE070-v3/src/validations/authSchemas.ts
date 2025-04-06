import * as yup from "yup";

export const authSchemas = {
  email: yup
    .string()
    .required("Please enter your email!")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email!"
    ),

  password: yup
    .string()
    .required("Please enter your password!")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
      "The password must be at least 8 characters long and include letters, numbers, and special characters!"
    ),
};

// Composite schemas
export const loginSchema = yup.object({
  email: authSchemas.email,
  password: authSchemas.password,
});

export const registerSchema = yup.object({
  email: authSchemas.email,
  password: authSchemas.password,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
