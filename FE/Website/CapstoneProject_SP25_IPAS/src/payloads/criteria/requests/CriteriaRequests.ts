export interface CriteriaMasterRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  isActive: boolean;
  createBy?: string;
  target: string;
  criterias: CriteriaRequest[]
}

export interface CriteriaRequest {
  criteriaId: number;
  criteriaName: string;
  criteriaDescription: string;
  priority: number;
}

interface CriteriaApplyData {
  criteriaId: number;
  priority: number;
}

export interface CriteriaCheckData {
  criteriaId: number;
  isChecked: boolean;
}

export interface CriteriaApplyRequest {
  plantLotId?: number[];
  plantId?: number[];
  graftedPlantId?: number[];
  criteriaData: CriteriaApplyData[];
}

export interface CriteriaCheckRequest {
  plantLotID?: number[];
  plantID?: number[];
  graftedPlantID?: number[];
  criteriaDatas: CriteriaCheckData[];
}

export interface CriteriaDeleteRequest {
  plantLotId?: number[];
  plantId?: number[];
  graftedPlantId?: number[];
  criteriaSetId: number[];
}
