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
  static getDocumentRules = () => this.getRequiredRules("Document Name");
  static getDocumentTypeRules = () => this.getRequiredRules("Document Type");

  static getStageNameRules = () => this.getRequiredRules("Growth Stage Name");
  static getMonthAgeStartRules = () => this.getNumberRules("Month Age Start");
  static getMonthAgeEndRules = () => this.getNumberRules("Month Age End");

  static getTypeNameRules = () => this.getRequiredRules("Type Name");
  static getTypeRules = () => this.getRequiredRules("Type");
  static getVolumeRequiredRules = () => this.getRequiredRules("Volume Required");
  static getCharacteristicRules = () => this.getRequiredRules("Characteristic");

  static getWorklogNameRules = () => this.getRequiredRules("Task Name");
  static getCropRules = () => this.getRequiredRules("Crop");
  static getLandPlotRules = () => this.getRequiredRules("Land Plot");
  static getWorklogTypeRules = () => this.getRequiredRules("Worklog Type");
  static getProcessRules = () => this.getRequiredRules("Process");
  static getTimeRules = () => this.getRequiredRules("Time");

  static getContentFeedbackRules = () => this.getRequiredRules("Content");
  static getStatusWorklogFeedbackRules = () => this.getRequiredRules("Status Worlog");

  static getPlanNameRules = () => this.getRequiredRules("Plan Name");
  static getPlanDetailRules = () => this.getRequiredRules("Plan Detail");
  static getGrowthStageRules = () => this.getRequiredRules("Growth Stage");

  static getPackageNameRules = () => this.getRequiredRules("Package Name");
  static getPackagePriceRules() {
    return [
      { required: true, message: "Please input the package price!" },
      { pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: "Price must be a positive number with up to two decimal places!" },
    ];
  }
  static getDurationRules() {
    return [
      { required: true, message: "Please input the duration!" },
      { pattern: /^[1-9]\d*$/, message: "Duration must be a positive integer!" },
    ];
  }
  
  static getPlanTypeRules = () => this.getRequiredRules("Plan Type");

  static getProcessNameRules = () => this.getRequiredRules("Process Name");
  static getProcessTypeRules = () => this.getRequiredRules("Process Type");


}
