export interface GetCriteria {
  criteriaId: number;
  criteriaCode: string;
  criteriaName: string;
  criteriaDescription: string;
  minValue: number;
  maxValue: number;
  unit: string;
  priority: number;
  frequencyDate: number;
}

export interface GetCriteriaByMasterType {
  masterTypeId: number;
  masterTypeCode: string;
  masterTypeName: string;
  masterTypeDescription: string;
  target: string;
  createDate: Date;
  isActive: boolean;
  criterias: GetCriteria[];
}

export interface GetCriteriaCheck {
  criteriaId: number;
  criteriaName: string;
  description: string;
  createDate: Date;
  checkedDate: Date;
  priority: number;
  minValue: number;
  maxValue: number;
  unit: string;
  valueChecked: number;
  isPassed?: boolean;
}

export interface GetCriteriaObject {
  masterTypeId: number;
  masterTypeName: string;
  target: string;
  criteriaList: GetCriteriaCheck[];
}

export interface GetCriteriaSelect {
  id: number;
  code: string;
  name: string;
}
