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
