export interface CriteriaRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  backgroundColor: string;
  textColor: string;
  characteristic: string;
  typeName: string;
  isActive: boolean;
  createBy?: string;
  isConflict: boolean;
  target: string;
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
