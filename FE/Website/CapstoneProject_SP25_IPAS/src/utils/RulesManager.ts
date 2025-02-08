export class RulesManager {
  static getRequiredRules(fieldName: string) {
    return [{ required: true, message: `${fieldName} is required!` }];
  }
  static getNumberRules(fieldName: string) {
    return [
      { required: true, message: `Please input the ${fieldName.toLowerCase()}!` },
      { pattern: /^(0|[1-9][0-9]*)(\.[0-9]+)?$/, message: `${fieldName} must be a valid number!` },
    ];
  }
  static getTextRules(fieldName: string, min = 2, max = 50, regex = /^[a-zA-ZÀ-ỹ\s]+$/) {
    return [
      { required: true, message: `Please input your ${fieldName.toLowerCase()}!` },
      {
        pattern: regex,
        message: `${fieldName} must be ${min} to ${max} characters and contain only letters and spaces!`,
      },
    ];
  }
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
  static getFullNameRules = () => this.getTextRules("Full name");

  static getPhoneNumberRules() {
    return [
      { required: true, message: "Please input your phone number!" },
      {
        pattern: /^[0-9]{10,15}$/,
        message: "Phone number must be 10 to 15 digits!",
      },
    ];
  }
  static getDOBRules = () => this.getRequiredRules("Date of Birth");
  static getGenderRules = () => this.getRequiredRules("Gender");
  // Rules cho FarmForm
  static getFarmNameRules = () => this.getRequiredRules("Farm Name");
  static getFarmDescriptionRules = () => this.getRequiredRules("Description");
  static getProvinceRules = () => this.getRequiredRules("Province/City");
  static getDistrictRules = () => this.getRequiredRules("District");
  static getWardRules = () => this.getRequiredRules("Ward");
  static getAddressRules = () => this.getRequiredRules("Address");
  static getAreaRules = () => this.getNumberRules("Area");
  static getSoilTypeRules = () => this.getRequiredRules("Soil Type");
  static getClimateZoneRules = () => this.getRequiredRules("Climate Zone");
}
