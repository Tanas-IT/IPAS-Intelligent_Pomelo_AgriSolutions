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
  unit: string;
  status: string;
  lastQuantity: number;
  importedDate: Date;
  note: string;
  partnerId: number;
  partnerName: string;
}
