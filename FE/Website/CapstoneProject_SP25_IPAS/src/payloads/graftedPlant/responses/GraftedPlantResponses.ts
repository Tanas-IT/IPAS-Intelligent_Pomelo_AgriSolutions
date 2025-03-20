export interface GetGraftedPlantSelected {
  id: number;
  code: string;
  name: string;
}

export interface GetGraftedPlant {
  graftedPlantId: number;
  graftedPlantCode: string;
  graftedPlantName: string;
  separatedDate: Date;
  status: string;
  graftedDate: Date;
  note: string;
  isCompleted: boolean
  plantLotId: number
}
