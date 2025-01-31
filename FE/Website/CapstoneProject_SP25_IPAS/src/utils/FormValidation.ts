import { UserForm } from "@/models/UserForm.model";

export const validateFullName = (value: string) => {
  if (!value.trim()) return "Họ và tên là bắt buộc";
  if (value.trim().length < 6) return "Họ và tên phải có ít nhất 6 ký tự";
  return "";
};

export const validatePhoneNumber = (value: string) => {
  if (!value.trim()) return "Số điện thoại là bắt buộc";
  if (!isValidPhoneNumber(value.trim())) return "Số điện thoại không hợp lệ";
  return "";
};

export const validateDOB = (value: any) => {
  return !value ? "Ngày sinh là bắt buộc" : "";
};

export const validateEmail = (email: string, oldEmail?: string) => {
  if (email.trim() === "") {
    return "Email là bắt buộc";
  } else if (!isValidEmail(email.trim()) || (oldEmail && email !== oldEmail)) {
    return "Email không hợp lệ";
  }
  return ""; // Trả về rỗng nếu không có lỗi
};

export const validateAddress = (address: string) => {
  return !address ? "Địa chỉ là bắt buộc" : "";
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // check độ dài 10, bắt đầu bằng 09, 08, 07, 05, 03
  const phoneRegex = /^(0?)(3[2-9]|5[2689]|7[0-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
  return phoneRegex.test(phoneNumber);
};

export const isInteger = (value: string) => {
  return /^\d+$/.test(value);
};

export const validateUserForm = (formData: UserForm) => {
  const errors = {
    fullName: validateFullName(formData.fullName.value),
    phoneNumber: validatePhoneNumber(formData.phoneNumber.value),
    DOB: validateDOB(formData.DOB.value),
  };
  return errors;
};

// export const validatePassword = (passwordForm: PasswordForm) => {
//   const errors = {
//     oldPassword: passwordForm.oldPassword.value !== "" ? "" : "Mật khẩu cũ là bắt buộc",
//     newPassword:
//       passwordForm.newPassword.value.length >= 6 ? "" : "Mật khẩu mới phải có ít nhất 6 ký tự",
//     confirm:
//       passwordForm.confirm.value === passwordForm.newPassword.value
//         ? ""
//         : "Xác nhận mật khẩu không khớp",
//   };

//   return errors;
// };
