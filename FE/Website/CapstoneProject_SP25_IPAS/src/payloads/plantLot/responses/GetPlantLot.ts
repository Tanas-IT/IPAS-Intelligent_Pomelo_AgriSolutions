export interface GetPlantLot {
  id: number;
  name: string;
  code: string;
}

export interface GetPlantLot2 {
  plantLotId: number;
  plantLotCode: string;
  plantLotName: string;
  previousQuantity: number;
  inputQuantity: number;
  lastQuantity: number;
  usedQuantity: number;
  unit: string;
  status: string;
  importedDate: Date;
  note: string;
  partnerId: number;
  partnerName: string;
  masterTypeId: number;
  seedingName: string;
  isPassed: boolean;
}

export interface GetPlantLotDetail extends GetPlantLot2 {
  additionalPlantLots: GetPlantLot2[];
}
