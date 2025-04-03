import { CriteriaCheckData } from "@/payloads/criteria";

export interface PlantLotRequest {
  plantLotId: number;
  plantLotName: string;
  partnerId: number;
  masterTypeId: number;
  previousQuantity: number;
  lastQuantity: number;
  unit: string;
  note: string;
  isFromGrafted: boolean;
}

export interface PlantLotCheckCriteriaRequest {
  plantLotID?: number;
  criteriaDatas: CriteriaCheckData[];
}
