export interface CriteriaMasterRequest {
  masterTypeId: number;
  masterTypeName: string;
  masterTypeDescription: string;
  isActive: boolean;
  createBy?: string;
  target: string;
  criterias: CriteriaRequest[];
}

export interface CriteriaRequest {
  criteriaId: number;
  criteriaName: string;
  criteriaDescription: string;
  minValue: number;
  maxValue: number;
  unit: string;
  priority: number;
  frequencyDate: number;
}

interface CriteriaApplyData {
  criteriaId: number;
  priority: number;
  frequencyDate: number;
}

export interface CriteriaCheckData {
  criteriaId: number;
  valueChecked: number;
}

export interface CriteriaApplyRequest {
  plantLotId?: number[];
  graftedPlantId?: number[];
  criteriaData: CriteriaApplyData[];
}

export interface PlantCriteriaApplyRequest {
  plantIds?: number[];
  criteriaData: CriteriaApplyData[];
}

export interface CriteriaPlantCheckRequest {
  plantIds?: number[];
  criteriaDatas: CriteriaCheckData[];
}

export interface CriteriaGraftedPlantCheckRequest {
  graftedPlantID?: number[];
  criteriaDatas: CriteriaCheckData[];
}

export interface CriteriaDeleteRequest {
  plantLotId?: number[];
  plantId?: number[];
  graftedPlantId?: number[];
  criteriaSetId: number[];
}

export interface ResetCriteriaPlantRequest {
  plantId: number;
  masterTypeId: number;
}
