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
  static getDOBRules = () => [{ required: true, message: "Please select your date of birth!" }];
  static getGenderRules = () => [{ required: true, message: "Please select your gender!" }];

  // Rules cho FarmForm
  static getFarmNameRules = () => [{ required: true, message: "Farm Name is required!" }];
  static getFarmDescriptionRules = () => [
    { required: true, message: "Description cannot be empty!" },
  ];
  static getProvinceRules = () => [{ required: true, message: "Please select a province/city!" }];
  static getDistrictRules = () => [{ required: true, message: "Please select a district!" }];
  static getWardRules = () => [{ required: true, message: "Please select a ward!" }];
  static getAddressRules = () => [{ required: true, message: "Address cannot be empty!" }];

  static getAreaRules() {
    return [
      { required: true, message: "Please input the area!" },
      { pattern: /^[0-9]+$/, message: "Area must be a valid number!" },
    ];
  }
  static getSoilTypeRules = () => [{ required: true, message: "Soil Type is required!" }];
  static getClimateZoneRules = () => [{ required: true, message: "Climate Zone is required!" }];
}
