export interface PlantLotRequest {
  plantLotId: number;
  plantLotName: string;
  partnerId: number;
  masterTypeId: number;
  previousQuantity: number;
  lastQuantity: number;
  unit: string;
  note: string;
}
