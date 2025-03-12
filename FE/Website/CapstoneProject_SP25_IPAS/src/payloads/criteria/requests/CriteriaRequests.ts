export interface CriteriaRequests {
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

export interface CriteriaApplyRequests {
  plantLotId: number[];
  plantId: number[];
  graftedPlantId: number[];
  criteriaData: CriteriaApplyData[];
}
