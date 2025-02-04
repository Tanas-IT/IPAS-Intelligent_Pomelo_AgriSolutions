export class RulesManager {
  static getEmailRules() {
    return [
      { required: true, message: "Please input your email!" },
      {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Please enter a valid email!",
      },
    ];
  }

  // Phương thức để lấy quy tắc cho password
  static getPasswordRules() {
    return [
      {
        required: true,
        message: "Please input your password!",
      },
      {
        pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
        message:
          "Password must be at least 8 characters long and include a letter, a number, and a special character!",
      },
    ];
  }

  static getFullNameRules() {
    return [
      { required: true, message: "Please input your full name!" },
      {
        pattern: /^[a-zA-ZÀ-ỹ\s]{2,50}$/,
        message: "Full name must be 2 to 50 characters and contain only letters and spaces!",
      },
    ];
  }
  static getPhoneNumberRules() {
    return [
      { required: true, message: "Please input your phone number!" },
      {
        pattern: /^[0-9]{10,15}$/,
        message: "Phone number must be 10 to 15 digits!",
      },
    ];
  }
  static getDOBRules() {
    return [{ required: true, message: "Please select your date of birth" }];
  }
  static getGenderRules() {
    return [{ required: true, message: "Please select your gender" }];
  }
}
