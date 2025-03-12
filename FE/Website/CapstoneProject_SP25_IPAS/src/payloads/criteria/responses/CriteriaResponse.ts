export interface GetCriteria {
  criteriaId: number;
  criteriaCode: string;
  criteriaName: string;
  criteriaDescription: string;
  priority: number;
}

export interface GetCriteriaByMasterType {
  masterTypeId: number;
  criterias: GetCriteria[];
}

export interface GetCriteriaCheck {
  criteriaId: number;
  criteriaName: string;
  criteriaDescription: string;
  priority: number;
  isChecked: boolean;
}

export interface GetCriteriaObject {
  masterTypeId: number;
  masterTypeName: string;
  target: string;
  criteriaList: GetCriteriaCheck[];
}
