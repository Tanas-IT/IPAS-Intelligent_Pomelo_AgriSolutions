export class RulesManager {
  static getRequiredRules(fieldName: string) {
    return [{ required: true, message: `${fieldName} is required!` }];
  }
  static getNumberRules(fieldName: string) {
    return [
      { required: true, message: `Please input the ${fieldName.toLowerCase()}!` },
      {
        pattern: /^(0\.\d+|[1-9]\d*(\.\d+)?)$/,
        message: `${fieldName} must be a valid number greater than 0!`,
      },
    ];
  }
  static getPriceRules(fieldName: string) {
    return [
      { required: true, message: `Please input the ${fieldName.toLowerCase()}!` },
      {
        pattern: /^(?:[1-9]\d{3,}|1000)(?:\.\d+)?$/,
        message: `${fieldName} must be a valid number greater than or equal to 1000!`,
      },
    ];
  }
  static getNumberNotRequiredRules(fieldName: string) {
    return [
      {
        pattern: /^(?!0$)(\d+(\.\d+)?$)/,
        message: `${fieldName} must be a valid number greater than 0!`,
      },
    ];
  }
  static getNumberInRange1To10Rules(fieldName: string) {
    return [
      {
        pattern: /^(10|[1-9])$/,
        message: `${fieldName}must be between 1 and 10!`,
      },
    ];
  }
  static getNumberRulesAllowZero(fieldName: string) {
    return [
      { required: true, message: `Please input the ${fieldName.toLowerCase()}!` },
      {
        pattern: /^(?:[1-9]\d*|0)(?:\.\d+)?$/, // Chấp nhận số >= 0
        message: `${fieldName} must be a valid number!`,
      },
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
        pattern: /^[0-9]{10,11}$/,
        message: "Phone number must be 10 or 11 digits!",
      },
    ];
  }

  static getPhoneNumberNotRequiredRules() {
    return [
      {
        pattern: /^[0-9]{10,11}$/,
        message: "Phone number must be 10 or 11 digits!",
      },
    ];
  }

  static getRequiredIfSelectedRules(dependentField: string, fieldName: string) {
    return [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          if (!getFieldValue(dependentField) || value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error(`${fieldName} is required!`));
        },
      }),
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

  static getLandPlotNameRules = () => this.getRequiredRules("Land Plot Name");
  static getTargetMarketRules = () => this.getRequiredRules("Target Market");
  static getRowLengthRules = () => this.getNumberRules("Row Length");
  static getRowWidthRules = () => this.getNumberRules("Row Width");
  static getNumberOfRowsRules = () => this.getNumberRules("Number of Rows");
  static getRowSpacingRules = () => this.getNumberRules("Row Spacing");
  static getRowsPerLineRules = () => this.getNumberRules("Rows per Line");
  static getLineSpacingRules = () => this.getNumberRules("Line Spacing");
  static getPlantsPerRowRules = () => this.getNumberRules("Plants per Row");
  static getPlantSpacingRules = () => this.getNumberRules("Spacing Between Plants");
  static getRowOrientationRules = () => this.getRequiredRules("Row Orientation");

  static getStageNameRules = () => this.getRequiredRules("Growth Stage Name");
  static getMonthAgeStartRules = () => this.getNumberRules("Month Age Start");
  static getMonthAgeEndRules = () => this.getNumberRules("Month Age End");

  static getTypeNameRules = () => this.getRequiredRules("Type Name");
  static getTargetRules = () => this.getRequiredRules("Target");
  static getIsConflictRules = () => this.getRequiredRules("Can Overlap");
  static getTimeRangeRules = () => this.getNumberRules("Time");
  static getTypeRules = () => this.getRequiredRules("Type");
  static getCriteriaRules = () => this.getRequiredRules("Criteria");
  static getPriorityRules = () => this.getRequiredRules("Priority");
  static getCheckIntervalDaysRules = () => this.getRequiredRules("Interval Days");
  static getVolumeRequiredRules = () => this.getRequiredRules("Volume Required");
  static getCharacteristicRules = () => this.getRequiredRules("Characteristic");

  static getLotNameRules = () => this.getRequiredRules("Lot Name");
  static getPartnerRules = () => this.getRequiredRules("Partner");
  static getQuantityRules = () => this.getNumberRulesAllowZero("Quantity");
  static getUnitRules = () => this.getRequiredRules("Unit");
  static getSelectRoleRules = () => this.getRequiredRules("Select Role");

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

  static getCultivarRules = () => this.getRequiredRules("Cultivar");
  static getPlantingDateRules = () => this.getRequiredRules("PlantingDate");
  static getDateRules = () => this.getRequiredRules("Date");
  static getSelectHealthStatusRules = () => this.getRequiredRules("Select Health Status");
  static getSelectPlotRules = () => this.getRequiredRules("Select Plot");
  static getSelectRowRules = () => this.getRequiredRules("Select Row");
  static getSelectPlantIndexRules = () => this.getRequiredRules("Select Plant Index");

  static getPackageNameRules = () => this.getRequiredRules("Package Name");
  static getPackagePriceRules() {
    return [
      { required: true, message: "Please input the package price!" },
      {
        pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        message: "Price must be a positive number with up to two decimal places!",
      },
    ];
  }
  static getDurationRules() {
    return [
      { required: true, message: "Please input the duration!" },
      { pattern: /^[1-9]\d*$/, message: "Duration must be a positive integer!" },
    ];
  }
  static getFeatureNameRules() {
    return [
      { required: true, message: "Please input the feature name!" },
      { min: 5, message: "Feature name must be at least 5 characters long!" },
    ];
  }

  static getPlanTypeRules = () => this.getRequiredRules("Plan Type");

  static getProcessNameRules = () => this.getRequiredRules("Process Name");
  static getSubProcessNameRules = () => this.getRequiredRules("Sub-Process Name");
  static getProcessTypeRules = () => this.getRequiredRules("Process Type");
  static getPlanTargetRules = () => this.getRequiredRules("Plan Target");
}
